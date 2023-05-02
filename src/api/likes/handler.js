const autoBind = require('auto-bind');

class LikesHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async postLikeHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyIsLiked(credentialId, id);
    await this._service.addLike(credentialId, id);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async deleteLikeByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteLikeById(credentialId, id);
    return {
      status: 'success',
      message: 'Like berhasil dihapus',
    };
  }

  async getLikesHandler(request, h) {
    const { id } = request.params;
    const likes = await this._service.getLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: parseInt(likes[0], 10),
      },
    });
    if (likes[1]) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = LikesHandler;
