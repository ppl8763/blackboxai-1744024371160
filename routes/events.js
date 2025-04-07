const express = require('express');
const { db } = require('../database');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Get all events (with search)
router.get('/', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM events';
  const params = [];

  if (search || category) {
    query += ' WHERE';
    if (search) {
      query += ' (title LIKE ? OR description LIKE ? OR location LIKE ? OR sponsor_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (search && category) query += ' AND';
    if (category) {
      query += ' category = ?';
      params.push(category);
    }
  }

  query += ' ORDER BY date ASC, time ASC';

  db.all(query, params, (err, events) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(events);
  });
});

// Create new event (authenticated)
router.post('/', authenticateToken, (req, res) => {
  const { title, description, date, time, location, category, sponsor_name, sponsor_logo } = req.body;
  
  db.run(
    `INSERT INTO events 
    (title, description, date, time, location, category, sponsor_name, sponsor_logo, user_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, date, time, location, category, sponsor_name, sponsor_logo, req.user.id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Get event details
router.get('/:id', (req, res) => {
  db.get(
    `SELECT e.*, u.username as organizer 
     FROM events e LEFT JOIN users u ON e.user_id = u.id 
     WHERE e.id = ?`,
    [req.params.id],
    (err, event) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    }
  );
});

// Update event (authenticated)
router.put('/:id', authenticateToken, (req, res) => {
  const { title, description, date, time, location, category, sponsor_name, sponsor_logo } = req.body;
  
  db.run(
    `UPDATE events SET 
      title = ?, description = ?, date = ?, time = ?, 
      location = ?, category = ?, sponsor_name = ?, sponsor_logo = ?
     WHERE id = ? AND user_id = ?`,
    [title, description, date, time, location, category, sponsor_name, sponsor_logo, req.params.id, req.user.id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(403).json({ error: 'Not authorized or event not found' });
      }
      res.json({ message: 'Event updated successfully' });
    }
  );
});

// Delete event (authenticated)
router.delete('/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM events WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(403).json({ error: 'Not authorized or event not found' });
      }
      res.json({ message: 'Event deleted successfully' });
    }
  );
});

module.exports = router;