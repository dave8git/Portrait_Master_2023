const Photo = require('../models/photo.model');
const requestIp = require('request-ip');
const Voter = require('../models/Voter.model');

/****** SUBMIT PHOTO ********/

const escape =  html => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;

    const correctTitle = escape(title);
    const correctAuthor = escape(author);
    const correctEmail = escape(email);

    const file = req.files.file;
    const fileExt = fileName.split('.').slice(-1)[0];


    if(correctTitle && correctAuthor && correctEmail && file && fileExt) { // if fields are not empty...
      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  const voterIp = requestIp.getClientIp(req);
  console.log(voterIp);
  try {
    let voter = await Voter.findOne({user: voterIp }); 
    if(!voter) {
      voter = new Voter({ user: voterIp });
    }
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      if(!voter.votes.includes(photoToUpdate.id)) {
        photoToUpdate.votes++;
        voter.votes.push(photoToUpdate.id);
        photoToUpdate.save();
        voter.save();
      } else {
        res.json({ msg: 'You cannot vote twice, you cheater!'});
      }
      
   
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
