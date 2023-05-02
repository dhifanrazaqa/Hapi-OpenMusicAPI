const autoBind = require('auto-bind');

class ActivitiesHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async getActivityHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    const activities = await this._service.getActivities(id, credentialId);
    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = ActivitiesHandler;
