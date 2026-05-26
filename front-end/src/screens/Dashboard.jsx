import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./login.css";
import "./dashboard.css";

const initialEvents = [
  {
    id: 1,
    name: "Concert de printemps",
    date: "2026-12-06",
    time: "20:00",
    location: "Tamatavy 501",
    description: "Un concert en plein air pour célébrer le début de la saison.",
    cover: "party.jpeg",
  },
  {
    id: 2,
    name: "Conférence Tech 2026",
    date: "2026-03-07",
    time: "09:00",
    location: "Arena Toamasina",
    description: "Une journée dédiée aux dernières innovations technologiques.",
    cover: "conference.jpeg",
  },
];

const userName = "Jessy Tsiriniaina"

const Dashboard = () => {
  const [events, setEvents] = useState(initialEvents);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteEventId, setDeleteEventId] = useState(null);

  const handleLogout = () => {
    navigate("/login");
  };

  const handleCreate = (newEvent) => {
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setShowModal(false);
  };

  const handleUpdate = (updated) => {
    setEvents(events.map((ev) => (ev.id === updated.id ? updated : ev)));
    setEditingEvent(null);
  };

  const handleDelete = (id) => {
    setDeleteEventId(id);
  };

  const confirmDelete = () => {
    setEvents(events.filter((ev) => ev.id !== deleteEventId));
    setDeleteEventId(null);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header" id='dashboard-header'>
        <h1 className="dashboard-brand">EventTrack</h1>
        <div className="dashboard-user">
          <span className="dashboard-username">{userName}</span>
          <button className="dashboard-logout" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <h2 className="dashboard-section-title">Mes événements</h2>
          <button className="dashboard-create-button" onClick={() => setShowModal(true)}>
            + Nouvel événement
          </button>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            Vous n'avez encore organisé aucun événement.
          </div>
        ) : (
          <div className="events-grid">
            {events.map((ev) => (
              <article key={ev.id} className="event-card">
                <img className="event-cover" src={ev.cover} alt={ev.name} />
                <div className="event-body">
                  <h3 className="event-name">{ev.name}</h3>
                  <p className="event-meta">{ev.date} • {ev.time}</p>
                  <p className="event-meta">{ev.location}</p>
                  <p className="event-description">{ev.description}</p>
                  <div className="event-actions">
                    <button
                      className="event-action-button event-action-edit"
                      onClick={() => setEditingEvent(ev)}
                    >
                      Modifier
                    </button>
                    <button
                      className="event-action-button event-action-delete"
                      onClick={() => handleDelete(ev.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <EventModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />
      )}

      {editingEvent && (
        <EventModal
          onClose={() => setEditingEvent(null)}
          onSubmit={handleUpdate}
          initialData={editingEvent}
        />
      )}

      {deleteEventId && (
        <DeleteConfirmModal
          onCancel={() => setDeleteEventId(null)}
          onConfirm={confirmDelete}
        />
      )}

    </div>
  );
}

function EventModal({ onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(
    initialData || {
      name: "",
      date: "",
      time: "",
      location: "",
      description: "",
      cover: "",
    }
);
  const [coverName, setCoverName] = useState("");
  const [error, setError] = useState("");

  const isEdit = Boolean(initialData);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setError("Veuillez choisir un fichier .jpeg ou .png");
      return;
    }
    setError("");
    setCoverName(file.name);
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, cover: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.cover) {
      setError("Veuillez ajouter une photo de couverture");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{isEdit ? "Modifier l'événement" : "Nouvel événement"}</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Photo de couverture (.jpeg ou .png)</label>
            <label className="cover-upload">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleCoverChange}
                className="cover-upload-input"
              />
              <span className="cover-upload-button">
                {form.cover ? "Changer l'image" : "Choisir une image"}
              </span>
              <span className="cover-upload-name">
                {coverName || (form.cover ? "Image actuelle" : "Aucun fichier choisi")}
              </span>
            </label>
            {form.cover && (
              <img src={form.cover} alt="Aperçu" className="cover-preview" />
            )}
            {error && <p className="modal-error">{error}</p>}
          </div>

          <div className="modal-field">
            <label className="modal-label">Nom de l'événement</label>
            <input type="text" className="modal-input" value={form.name} onChange={update("name")} required />
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Date</label>
              <input type="date" className="modal-input" value={form.date} onChange={update("date")} required />
            </div>
            <div className="modal-field">
              <label className="modal-label">Heure de début</label>
              <input type="time" className="modal-input" value={form.time} onChange={update("time")} required />
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Lieu</label>
            <input type="text" className="modal-input" value={form.location} onChange={update("location")} required />
          </div>

          <div className="modal-field">
            <label className="modal-label">Description</label>
            <textarea className="modal-textarea" value={form.description} onChange={update("description")} required />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-button modal-button-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="modal-button modal-button-primary">
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Confirmer la suppression</h2>
        <p className="modal-confirm-text">
          Voulez-vous vraiment supprimer cet événement ?
        </p>
        <div className="modal-actions">
          <button className="modal-button modal-button-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="modal-button modal-button-danger" onClick={onConfirm}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}


export default Dashboard