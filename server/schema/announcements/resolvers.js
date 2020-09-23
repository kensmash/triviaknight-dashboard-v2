const mongoose = require("mongoose");
const Announcement = require("../../models/Announcement");
const User = require("../../models/User");
//auth helpers
const {
  requiresAuth,
  requiresAdmin,
} = require("../_helpers/helper-permissions");

const resolvers = {
  Query: {
    announcements: requiresAuth.createResolver((parent, args) => {
      return Announcement.find({ published: true })
        .sort({ updatedAt: -1 })
        .limit(8);
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
              .limit(limit),
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

    announcementsWidget: async (parent, args) => {
      try {
        const widget = await Promise.all([
          Announcement.estimatedDocumentCount(),
          Announcement.countDocuments({ published: { $eq: false } }),
        ]);

        const totalannouncements = widget[0];
        const unpublishedannouncements = widget[1];

        return {
          totalannouncements,
          unpublishedannouncements,
        };
      } catch (error) {
        console.error(error);
      }
    },
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

          if (input.published) {
            await User.updateMany(
              {},
              {
                $set: { hasSeenAnnouncements: false },
              }
            );
          }

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
