const Joi = require('joi');

const PlaylistPayLoadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistSongPayLoadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { PlaylistPayLoadSchema, PlaylistSongPayLoadSchema };
