import { defineConfig } from "tinacms";
import { TinaEmbed, validateGPSCoordinates } from "../src/components/travelslot";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
const mapField = {
  components: {
    TinaEmbed
  },
  templates: [
    {
      name: "Map",
      label: "Map",
      fields: [
        {
          type: 'string',
          name: 'gpsCoordinates',
          label: 'GPS Coordinates',
          isRequired: true,
          placeholder: '30 19\' 45.49N\, 35 26\' 34.86E',
          validate: validateGPSCoordinates,
        },
        {
          type: 'string',
          name: 'latitude',
          label: 'Latitude',
        },
        {
          type: 'string',
          name: 'longitude',
          label: 'Longitude',
        },
      ],
    },
  ],
}

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID || "",
  token: process.env.TINA_CONTENT_TOKEN || "",

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    loadCustomStore: async () => {
      const pack = await import("next-tinacms-cloudinary");
      return pack.TinaCloudCloudinaryMediaStore;
    },
  },
  schema: {
    collections: [
      {
        name: "travels",
        label: "Travels",
        path: "src/content/travels",
        format: "mdx",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => {
              // Values is an object containing all the values of the form. In this case it is {title?: string, topic?: string}
              return `${values?.title
                ?.toLowerCase()
                .replace(/ /g, '-')
                .replace(/[!.,@#$%^&*()/\\+=]/g, '')}`
            },
          },
          router: (props) => {
            return `/travels/${props.document._sys.filename.toLowerCase()}`
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Published date",
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
            templates: mapField.templates,
            components: mapField.components,
          },
        ],
      },
      {
        name: "projects",
        label: "Projects",
        path: "src/content/projects",
        format: "md",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => {
              // Values is an object containing all the values of the form. In this case it is {title?: string, topic?: string}
              return `${values?.title
                ?.toLowerCase()
                .replace(/ /g, '-')
                .replace(/[!.,@#$%^&*()/\\+=]/g, '')}`
            },
          },
          router: (props) => {
            return `/projects/${props.document._sys.filename.toLowerCase()}`
          },
        },
        fields: [
          {
            name: "hero",
            type: "image",
            label: "Hero Image",
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Published date",
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "posts",
        label: "Posts",
        path: "src/content/posts",
        format: "mdx",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => {
              // Values is an object containing all the values of the form. In this case it is {title?: string, topic?: string}
              return `${values?.title
                ?.toLowerCase()
                .replace(/ /g, '-')
                .replace(/[!.,@#$%^&*()/\\+=]/g, '')}`
            },
          },
          router: (props) => {
            return `/blog/${props.document._sys.filename.toLowerCase()}`
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Published date",
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN || "",
      stopwordLanguages: ['eng']
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100
  },
});
