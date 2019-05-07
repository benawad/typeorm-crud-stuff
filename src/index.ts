import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { User } from "./entity/User";
import { Note } from "./entity/Note";
import { SharedNote } from "./entity/SharedNote";

createConnection()
  .then(async conn => {
    // crud single table
    const u1 = await User.create({ username: "bob" }).save();
    await User.update({ id: u1.id }, { username: "tom" });
    await User.findOne({ username: "tom" });
    await User.find({ where: { username: "tom" } });
    await User.delete({ username: "tom" });

    // crud many to one
    const joe = await User.create({ username: "joe" }).save();
    const note = await Note.create({ text: "hello", ownerId: joe.id }).save();
    // all the notes joe created
    const notes = await Note.find({ ownerId: joe.id });
    console.log(notes);

    // crud many to many
    const tim = await User.create({ username: "tim" }).save();
    await SharedNote.create({
      senderId: joe.id,
      targetId: tim.id,
      noteId: note.id
    }).save();
    console.log("....");
    const notesSharedWithTim = await SharedNote.find({
      where: {
        targetId: tim.id
      },
      relations: ["note"]
    });
    console.log(notesSharedWithTim);

    // typeorm relations
    await User.findOne(
      { id: tim.id },
      { relations: ["notesSharedWithYou", "notesSharedWithYou.note"] }
    );
    await User.findOne(
      { id: joe.id },
      { relations: ["notesYouShared", "notesYouShared.note"] }
    );
    console.log("____start_____");
    await User.findOne(
      { id: joe.id },
      {
        relations: [
          "notesYouShared",
          "notesYouShared.note",
          "notesSharedWithYou",
          "notesSharedWithYou.note"
        ]
      }
    );
    console.log("____end_____");

    // get all notes joe owns or was shared with him
    // in 1 sql query
    await conn
      .getRepository(Note)
      .createQueryBuilder("n")
      .leftJoin(SharedNote, "sn", 'sn."noteId" = n.id')
      .where('n."ownerId" = :ownerId', { ownerId: joe.id })
      .orWhere('sn."targetId" = :ownerId', { ownerId: joe.id })
      .getMany();
  })
  .then(() => process.exit())
  .catch(error => console.log(error));
