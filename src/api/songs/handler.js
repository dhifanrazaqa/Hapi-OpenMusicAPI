const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const songId = await this._service.addSong(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const songs = await this._service.getSongs(request.query);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song: {
          id: song.id,
          title: song.title,
          year: parseInt(song.year, 10),
          performer: song.performer,
          genre: song.genre,
          duration: parseInt(song.duration, 10),
          albumId: song.albumId,
        },
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const {
      title, year, performer, genre, duration, albumId,
    } = request.payload;
    const { id } = request.params;

    await this._service.editSongById(id, {
      title, year, performer, genre, duration, albumId,
    });

    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
