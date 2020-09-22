const mongoose = require("mongoose");
const Announcement = require("../../models/Announcement");
//auth helpers
const {
  requiresAuth,
  requiresAdmin,
} = require("../_helpers/helper-permissions");

const resolvers = {
  Query: {
    announcements: requiresAuth.createResolver((parent, args) => {
      return Announcement.find({}).sort({ updatedAt: 1 });
    }),

    announcementsPage: requiresAdmin.createResolver(
      async (parent, { offset, limit }) => {
        const queryBuilder = () => {
          const query = {};
          return query;
        };
        try {
          const announcements = await Promise.all([
            Announcement.find(queryBuilder())
              .sort({ name: 1 })
              .skip(offset)
              .limit(limit)
              .populate("categories"),
            Announcement.countDocuments(queryBuilder()),
          ]);
          const announcementResults = announcements[0];
          const announcementCount = announcements[1];
          return {
            pages: Math.ceil(announcementCount / limit),
            totalrecords: announcementCount,
            announcements: announcementResults,
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    announcement: requiresAdmin.createResolver((parent, { id }) => {
      return Announcement.findOne({ _id: id });
    }),
  },

  Mutation: {
    upsertannouncement: requiresAdmin.createResolver(
      async (parent, { input }) => {
        try {
          const upsertedAnnouncement = await Announcement.findOneAndUpdate(
            {
              _id: mongoose.Types.ObjectId(input.id),
            },
            input,
            { upsert: true, new: true }
          );

          return upsertedAnnouncement;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    deleteannouncement: requiresAdmin.createResolver(async (parent, { id }) => {
      try {
        const deletedAnnouncement = await Announcement.deleteOne({
          _id: id,
        });
        return deletedAnnouncement;
      } catch (error) {
        console.error(error);
      }
    }),
  },
};

module.exports = {
  resolvers,
};
