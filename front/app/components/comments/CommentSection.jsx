"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/app/lib/api";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";
import CommentSkeleton from "./CommentSkeleton";
import { useAuth } from "@/app/context/AuthContext";

export default function CommentSection({ postId, autoFocus = false }) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [focusForm, setFocusForm] = useState(false);
  const containerId = `comment-section-${postId}`;

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.postComments.recent(postId, { limit: 20 });
      if (res && res.content) setComments(res.content);
      else if (Array.isArray(res)) setComments(res);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (autoFocus) {
      // Set local flag to instruct CommentForm to autofocus and scroll into view
      setFocusForm(true);
      setTimeout(() => {
        const el = document.getElementById(containerId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [autoFocus, containerId]);

  const handleCreate = async (text) => {
    setSubmitting(true);
    try {
      const payload = { content: text };
      const created = await api.postComments.create(postId, payload);
      // prepend
      setComments((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Failed to create comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (comment) => {
    setEditingComment(comment);
  };

  const handleUpdate = async (text) => {
    if (!editingComment) return;
    setSubmitting(true);
    try {
      const updated = await api.postComments.update(editingComment.id, { content: text });
      setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingComment(null);
    } catch (err) {
      console.error("Failed to update comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment) => {
    if (!confirm("Confirma remoção do comentário?")) return;
    try {
      await api.postComments.delete(comment.id);
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  return (
    <div id={containerId} className="mt-4">
      <div className="mb-3">
        <CommentForm
          initialValue={editingComment ? editingComment.content : ""}
          onSubmit={editingComment ? handleUpdate : handleCreate}
          onCancel={() => setEditingComment(null)}
          submitting={submitting}
          autoFocus={focusForm}
        />
      </div>

      <div className="bg-surface border border-default rounded-lg p-3">
        {loading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : comments.length === 0 ? (
          <div className="text-center text-secondary py-6">Seja o primeiro a comentar</div>
        ) : (
          <div>
            {comments.map((c) => (
              <CommentCard key={c.id} comment={c} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
