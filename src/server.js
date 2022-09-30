// Welcome to the tutorial!
import {
  createServer,
  Model,
  hasMany,
  belongsTo,
  RestSerializer,
  Factory,
  trait,
} from "miragejs";

export default function (environment = "development") {
  createServer({
    environment,
    models: {
      list: Model.extend({
        reminders: hasMany(),
      }),

      reminder: Model.extend({
        list: belongsTo(),
      }),
    },

    serializers: {
      reminder: RestSerializer.extend({
        include: ["list"],
        embed: true,
      }),
    },

    factories: {
      list: Factory.extend({
        name(i) {
          return `List ${i}`;
        },

        // afterCreate(list, server) {
        //   if(!list.reminders.length) {
        //     server.createList("reminder", 5, { list });
        //   }
        // },
        withReminders: trait({
          afterCreate(list, server) {
            server.createList("reminder", 5, { list });
          },
        }),
      }),
      reminder: Factory.extend({
        // text: "Reminder text",
        text(i) {
          return `Reminder text ${i}`;
        },
      }),
    },

    seeds(server) {
      server.create("reminder", { text: "Walk the dog" });
      server.create("reminder", { text: "Tale out the trash" });
      server.create("reminder", { text: "Work out" });
      server.create("list", {
        name: "Home",
        reminders: [server.create("reminder", { text: "Do taxes" })],
      });
      server.create("list", {
        name: "Work",
        reminders: [server.create("reminder", { text: "Visit bank" })],
      });

      // Experiment #3
      // server.create("list", {
      //   name: "Home",
      //   reminders: [server.create("reminder", { text: "Do taxes" })],
      // });
      //
      server.create("list", "withReminders");

      // Experiment #2
      // server.createList("list", 3);
      // server.create("list");

      // Experiment #1
      // server.create("reminder", { text: "Walk the dog" });
      // server.create("reminder", { text: "Tale out the trash" });
      // server.create("reminder", { text: "Work out" });
      //
      // server.create("reminder");
      // server.create("reminder");
      // server.create("reminder");
      // server.createList("reminder", 100);
      //
      // server.create("list", {
      //   reminders: server.createList("reminder", 5),
      // });
      //
      // let homeList = server.create("list", { name: "Home" });
      // server.create("reminder", { list: homeList, text: "Do taxes" });
      //
      // let workList = server.create("list", { name: "Work" });
      // server.create("reminder", { list: workList, text: "Visit bank" });
    },

    routes() {
      this.get("/api/reminders", (schema) => {
        return schema.reminders.all();
      });

      this.post("/api/reminders", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        console.log(attrs);

        return schema.reminders.create(attrs);
      });

      this.delete("/api/reminders/:id", (schema, request) => {
        let id = request.params.id;

        return schema.reminders.find(id).destroy();
      });

      this.get("/api/lists", (schema, request) => {
        return schema.lists.all();
      });

      this.get("/api/lists/:id/reminders", (schema, request) => {
        let listId = request.params.id;
        let list = schema.lists.find(listId);

        return list.reminders;
      })
    }
  });
}
