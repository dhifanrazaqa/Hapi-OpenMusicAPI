const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBSongsToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    const result = await this._pool.query('SELECT id, title, performer FROM songs');
    let songs = result.rows;
    if (title) {
      songs = songs.filter((n) => n.title.toLowerCase().includes(title.toLowerCase()));
    }
    if (performer) {
      songs = songs.filter((n) => n.performer.toLowerCase().includes(performer.toLowerCase()));
    }
    return songs;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapDBSongsToModel)[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6  WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui Lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
