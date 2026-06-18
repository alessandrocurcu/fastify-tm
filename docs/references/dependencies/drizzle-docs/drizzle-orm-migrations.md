# Drizzle migrations fundamentals

SQL databases require you to specify a **strict schema** of entities you’re going to store upfront and if (when) you need to change the shape of those entities - you will need to do it via **schema migrations**.

There’re multiple production grade ways of managing database migrations. Drizzle is designed to perfectly suits all of them, regardless of you going **database first** or **codebase first**.

**Database first** is when your database schema is a source of truth. You manage your database schema either directly on the database or via database migration tools and then you pull your database schema to your codebase application level entities.

**Codebase first** is when database schema in your codebase is a source of truth and is under version control. You declare and manage your database schema in JavaScript/TypeScript and then you apply that schema to the database itself either with Drizzle, directly or via external migration tools.

#### How can Drizzle help?

We’ve built [drizzle-kit](https://orm.drizzle.team/docs/kit-overview) - CLI app for managing migrations with Drizzle.

```shell
drizzle-kit migrate
drizzle-kit generate
drizzle-kit push
drizzle-kit pull
```

It is designed to let you choose how to approach migrations based on your current business demands.

It fits in both database and codebase first approaches, it lets you **push your schema** or **generate SQL migration** files or **pull the schema** from database. It is perfect wether you work alone or in a team.

---

**Now let’s pick the best option for your project:**

**Option 1**

> I manage database schema myself using external migration tools or by running SQL migrations directly on my database. From Drizzle I just need to get current state of the schema from my database and save it as TypeScript schema file.

> > Expand details

**Option 2**

> I want to have database schema in my TypeScript codebase, I don’t wanna deal with SQL migration files.
>  I want Drizzle to “push” my schema directly to the database

> > Expand details

**Option 3**

> I want to have database schema in my TypeScript codebase, I want Drizzle to generate SQL migration files for me and apply them to my database

> > Expand details

**Option 4**

> I want to have database schema in my TypeScript codebase, I want Drizzle to generate SQL migration files for me and I want Drizzle to apply them during runtime

> > Expand details

**Option 5**

> I want to have database schema in my TypeScript codebase, I want Drizzle to generate SQL migration files for me, but I will apply them to my database myself or via external migration tools

> > Expand details

**Option 6**

> I want to have database schema in my TypeScript codebase, I want Drizzle to output the SQL representation of my Drizzle schema to the console, and I will apply them to my database via [Atlas](https://atlasgo.io/guides/orms/drizzle)

> > Expand details