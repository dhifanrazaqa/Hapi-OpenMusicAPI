const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
// const AuthorizationError = require('../../exceptions/AuthorizationError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    const queryCheck = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const checkAlbum = await this._pool.query(queryCheck);

    if (!checkAlbum.rowCount) {
      throw new NotFoundError('Like gagal ditambahkan');
    }

    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
    return result.rows[0].id;
  }

  async deleteLikeById(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like gagal dihapus. tidak ditemukan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikes(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      return [JSON.parse(result), true];
    } catch (error) {
      const query = {
        text: `SELECT COUNT(*)
        FROM user_album_likes
        WHERE album_id = $1`,
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const mappedResult = result.rows[0].count;

      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(mappedResult));

      return [mappedResult, false];
    }
  }

  async verifyIsLiked(userId, albumId) {
    const query = {
      text: `SELECT * FROM user_album_likes 
      WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (result.rows.length) {
      throw new InvariantError('Anda sudah menyukai album');
    }
  }

  // async verifyLikeOwner(id, owner) {
  //   const query = {
  //     text: 'SELECT * FROM likes WHERE id = $1',
  //     values: [id],
  //   };
  //   const result = await this._pool.query(query);
  //   if (!result.rows.length) {
  //     throw new NotFoundError('Like tidak ditemukan');
  //   }
  //   const like = result.rows[0];
  //   if (like.owner !== owner) {
  //     throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  //   }
  // }

  // async verifyLikeAccess(likeId, userId) {
  //   try {
  //     await this.verifyLikeOwner(likeId, userId);
  //   } catch (error) {
  //     if (error instanceof NotFoundError) {
  //       throw error;
  //     }
  //     try {
  //       await this._collaborationService.verifyCollaborator(likeId, userId);
  //     } catch {
  //       throw error;
  //     }
  //   }
  // }
}

module.exports = LikesService;
