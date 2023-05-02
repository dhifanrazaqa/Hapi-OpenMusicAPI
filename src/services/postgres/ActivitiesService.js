const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Activity gagal ditambahkan');
    }
  }

  async getActivities(playlistId, userId) {
    await this.verifyPlaylistAccess(playlistId, userId);
    const query = {
      text: `SELECT users.username, songs.title, action, time
      FROM playlist_song_activities
      LEFT JOIN users ON playlist_song_activities.user_id = users.id
      LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Activity tidak tersedia');
    }
    return result.rows;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = ActivitiesService;
