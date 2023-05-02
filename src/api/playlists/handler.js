const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist(request.payload, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }

  async postSongPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.addSongPlaylist(credentialId, request.payload, id);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async getSongPlaylistsHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(id, credentialId);
    const playlists = await this._service.getSongPlaylistById(id);
    return {
      status: 'success',
      data: {
        playlist: {
          id: playlists[0].id,
          name: playlists[0].name,
          username: playlists[0].username,
          songs: playlists[1],
        },
      },
    };
  }

  async deleteSongPlaylistByIdHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.deleteSongPlaylistById(credentialId, request.payload, id);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
