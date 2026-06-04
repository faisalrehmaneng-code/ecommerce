const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    left1: String,
    left2: String,
    main1: String,
    main2: String,
    right1: String,
    right2: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', BannerSchema);
