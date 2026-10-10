import { defineConfig, type TinaField } from "tinacms"

import { Map as EmbedMap, type MapType } from "../src/components/react/Tina/Map.tsx"
import { IFrame } from "../src/components/react/Tina/IFrame.tsx"
import { validateGPSCoordinates } from "../src/lib/map.js"

// Content lives in shelf-private, so TinaCloud only knows that repo's
// branches. Code branches (Vercel previews) must not leak in here.
const branch = process.env.TINA_BRANCH || "main"
type StringField = Extract<TinaField, { type: 'string' }>

const publishedField = () => ({
  type: 'boolean' as const,
  name: 'published',
  label: 'Published',
  ui: {
    component: 'toggle',
    toggleLabels: { true: 'On', false: 'Off' },
  },
})

const mapTypeField: StringField & {
  ui: NonNullable<StringField['ui']> & { defaultItem: { mapType: MapType } }
} = {
  type: 'string',
  name: 'mapType',
  label: 'Map Type',
  ui: {
    defaultItem: { mapType: 'Openstreetmaps' },
  },
  options: [
    { value: 'Openstreetmaps', label: 'Openstreetmaps' },
    { value: 'GoogleGPS', label: 'Google GPS' },
    { value: 'GoogleSearch', label: 'Google Search' },
    { value: 'GoogleGeneral', label: 'Google General (no marker)' },
  ],
}

const gpsCoordinatesField: StringField & {
  isRequired: boolean
  placeholder: string
  validate: typeof validateGPSCoordinates
} = {
  type: 'string',
  name: 'gpsCoordinates',
  label: 'GPS Coordinates',
  isRequired: true,
  placeholder: '30 19 45.49N, 35 26 34.86E',
  validate: validateGPSCoordinates,
}

const mapField = {
  components: {
    EmbedMap,
    IFrame
  },
  templates: [
    {
      name: "Video",
      label: "cldVideo",
      fields: [
        {
          type: 'string' as const,
          name: 'videoUrl',
          label: 'Video URL'
        },
      ],
    },
    {
      name: "IFrame",
      label: "iFrame",
      fields: [
        {
          type: 'string' as const,
          name: 'embedCode',
          label: 'Embed Code'
        },
      ],
    },
    {
      name: "Map",
      label: "Map",
      fields: [
        mapTypeField,
        gpsCoordinatesField,
      ],
    },
  ],
}

const travelBodyField = {
  type: 'rich-text' as const,
  name: 'body',
  label: 'Body',
  isBody: true,
  searchable: true,
  templates: mapField.templates,
  components: mapField.components,
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
      const pack = await import("next-tinacms-cloudinary")
      return pack.TinaCloudCloudinaryMediaStore
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
          publishedField(),
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
            searchable: true,
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
          travelBodyField,
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
          publishedField(),
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
            searchable: true,
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
            searchable: true,
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
          publishedField(),
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
            searchable: true,
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
            searchable: true,
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
})
