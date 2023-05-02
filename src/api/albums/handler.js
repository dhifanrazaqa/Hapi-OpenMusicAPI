const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = 'untitled', year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album: {
          id: album[0].id,
          name: album[0].name,
          year: parseInt(album[0].year, 10),
          coverUrl: album[0].coverUrl,
          songs: album[1],
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
