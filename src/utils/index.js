/* eslint-disable camelcase */
const mapDBAlbumsToModel = ({
  id,
  name,
  year,
  cover_url,
}) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
});

const mapDBSongsToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

module.exports = { mapDBAlbumsToModel, mapDBSongsToModel };
