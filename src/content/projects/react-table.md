---
title: Data tables and forms
pubDate: 2024-11-10T16:00:00.000Z
description: TanStack react table
---

In September 2020, I started work with EM Services. With 5 teammates, 1 whom was comfortable writing in Javascript and 4 who wanted to learn on this project. The project ended on December 2020 after development and meetings for just over 12 weeks.

Ka Yi, Joel, Daniel, Raymond, Yee Qing.

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731333811/posts/file_kwnmgb.png)

## Understanding business needs: Many types of forms

Project management documents are sometimes in paper form, filed in binders.

The first step of data transformation has happened and documents have been saved in Excel spreadsheets (exportable as csv).

The second step is us. Centralisation of data in databases to:

* perform various calculations
* project information at a glance such as number of on-going projects
* total cost incurred
* pending work

We want to consolidate all project data for product dashboard projection.

### Challenge 1: Data adheres to project types

Data is scattered in different formats, each project has its own type of form. One form may have section headers and columns of items, and another form may opt for two nested layers of section headers (for reasons such as separation by Singapore districts) and include different column headers for its items.

### Challenge 2: External vendors have non-standard forms

One reason for the mini explosion of form types is the work with multiple external teams, and no requirement to standardise data formats. This means flexibility of our data ingestion is important, which will affect database design, trade-offs.

### Database design

Two approaches: A, B.

A, Model the database to separate project types - Project 1 and 2 has Class X and Class Y.

B, Model the project types to fit a generic flexible class, Project 3 and 4 have the same Class. But the differences in Project 3 and 4 are built into the frontend. There will be additional layers of complexity on the frontend to match differences in Project 3 and Project 4.

### Tradeoff

Approach A will have a harder time performing calculations, trading complexity in calculations for a simpler way for user data input (just upload existing formats).

Approach B is flipping the approach, using frontend to accomodate similar data input styles, but standardising how data is stored across all project types. This means shifting development from backend complexity to the frontend designs, or the middle layer handling data will grow in complexity with data transformations.

### Selecting B, and database schema![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731381710/posts/file_kvipqd.jpg)

Special mention to Sections class, where 1 Section can have many Sections. This is opposed to having N types of Sections for N types of forms, such as SectionTypeA, SectionTypeB, to SectionTypeN.

### API Complexity

Note: There are bad practices I'm aware of. The endpoints do not adhere to restful standards. 

These were written by different members in the team, and I wanted to show that an honest take, the pool of code we had. I did not plan user stories and tickets to allocate work at depth.

#### server/routes/claims/section.js

```javascript
const express = require("express");
const router = express.Router();
const pool = require("../../db");

// GET section id
router.get("/update/:section_id", async (req, res) => {
  try {
    const { section_id } = req.params;
    const allForms = await pool.query(
      `SELECT *
      FROM sections
      WHERE section_id = $1`,
      [section_id],
    );
    res.json(allForms.rows);
  } catch (error) {
    console.error(error.message);
  }
});

// GET section by section id
router.get("/:section_id", async (req, res) => {
  try {
    const { section_id } = req.params;
    const getSection = await pool.query(
      `SELECT *
      FROM sections
      WHERE section_id = $1`,
      [section_id],
    );
    res.json(getSection.rows);
  } catch (error) {
    console.error(error.message);
  }
});

// GET child sections of section id
router.get("/children/:section_id", async (req, res) => {
  try {
    // console.log("here");
    const { section_id } = req.params;
    const getChildSections = await pool.query(
      "SELECT * FROM sections WHERE parent_section_id = $1",
      [section_id],
    );
    res.json(getChildSections.rows);
  } catch (error) {
    console.log(error.message);
  }
});

// GET root-level section
router.get("/form/:form_id", async (req, res) => {
  try {
    // console.log("section route");
    const { form_id } = req.params;
    const allForms = await pool.query(
      `SELECT *
      FROM sections
      WHERE  form_id = $1 AND parent_section_id IS NULL`,
      [form_id],
    );
    res.json(allForms.rows);
  } catch (error) {
    console.error(error.message);
  }
});

// POST creation section 2 and 3
router.post("/", async (req, res) => {
  // console.log("here");
  try {
    const {
      parent_section_id,
      form_id,
      section_serial_no,
      section_heading,
      section_type,
      amount,
      division,
      gl_code,
      template_id,
    } = req.body;
    // console.log(req.body);

    const newSection = await pool.query(
      "INSERT INTO sections (parent_section_id, form_id, section_serial_no, section_heading, section_type, amount, division, gl_code, template_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",

      [
        parent_section_id,
        form_id,
        section_serial_no,
        section_heading,
        section_type,
        amount,
        division,
        gl_code,
        template_id,
      ],
    );
    // console.log(newSection.rows[0]);
    const newlyCreatedSectionId = newSection.rows[0].section_id;
    res.status(201).json({
      status: "success",
      data: {
        section: newSection.rows[0],
      },
    });
    if (template_id !== null) {
      //for RR - condition : template ID is not null for work description
      //Autofill the dataentry for work descriptions under RR based on template
      const templateEntries =
        await getTemplateEntriesFromTemplateId(template_id);
      // console.log(templateEntries);
      // console.log("here");
      const newDataEntry = await autoAddDataEntryToSection(
        templateEntries,
        newlyCreatedSectionId,
        form_id,
      );
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// DEL section 2 and 3
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteSection = await pool.query(
      "DELETE FROM sections WHERE section_id = $1",
      [id],
    );
    res.json("Section was deleted");
  } catch (err) {
    console.log(err.message);
  }
});

// GET all sections
router.get("/", async (req, res) => {
  try {
    const allForms = await pool.query(
      `SELECT *
      FROM sections`,
    );
    res.json(allForms.rows);
  } catch (error) {
    console.error(error.message);
  }
});

// PUT sections
router.put("/", async (req, res) => {
  try {
    const {
      parent_section_id,
      section_id,
      form_id,
      section_serial_no,
      section_heading,
      section_type,
      amount,
      division,
      gl_code,
    } = req.body;
    const updateSection = await pool.query(
      "UPDATE Sections SET parent_section_id = $1, form_id=$2, section_serial_no = $3, section_heading = $4, section_type = $5, amount = $6 , division = $7, gl_code = $8 WHERE section_id = $9 RETURNING *",

      [
        parent_section_id,
        form_id,
        section_serial_no,
        section_heading,
        section_type,
        amount,
        division,

        gl_code,
        section_id,
      ],
    );
    // console.log(updateSection.rows[0]);
    res.status(201).json({
      status: "success",
      data: {
        section: updateSection.rows[0],
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
// PUT template id of section
router.put("/template", async (req, res) => {
  try {
    const { section_id, template_id } = req.body;

    // console.log("sectionId:" + section_id);

    // console.log("templateId: " + template_id);
    const updateSection = await pool.query(
      "UPDATE Sections SET template_id = $1  WHERE section_id = $2 RETURNING *",
      [template_id, section_id],
    );
    // console.log(updateSection.rows[0]);

    res.status(201).json({
      status: "success",
      data: {
        section: updateSection.rows[0],
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

async function getTemplateEntriesFromTemplateId(template_id) {
  const templateEntries = await pool.query(
    "SELECT * FROM templateentry WHERE template_id = $1",
    [template_id],
  );
  const result = templateEntries.rows;
  return result;
}

async function autoAddDataEntryToSection(templateEntries, section_id, form_id) {
  // console.log("auto");
  // console.log(templateEntries);
  // console.log(section_id);

  let i = 0;
  for (i = 0; i < templateEntries.length; i++) {
    // console.log(templateEntries[i].templateentry_name);
    try {
      const newDataEntry = await pool.query(
        "INSERT INTO dataentry (form_id, row_serial_no, section_id, dataentry_name, template_entry_id) VALUES ($1, $2 , $3, $4, $5) RETURNING *",
        [
          form_id,
          i,
          section_id,
          templateEntries[i].templateentry_name,
          templateEntries[i].templateentry_id,
        ],
      );
    } catch (error) {
      console.log(error);
    }
  }
  // console.log("exit loop");
}

// GET all comment_threads
router.get("/comments", async (req, res) => {
  // console.log("here");
  try {
    const allThreads = await pool.query(
      `SELECT *
      FROM comment_threads`,
    );
    res.json(allThreads.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.get(
  "/calculation/contractSumFromSections/:form_id",
  async (req, res) => {
    try {
      const { form_id } = req.params;
      const sections = await pool.query(
        "SELECT amount FROM sections WHERE form_id = $1",
        [form_id],
      );
      console.log(sections.rows);
      let totalContractSum = 0;
      let i = 0;
      for (i = 0; i < sections.rows.length; i++) {
        let amount = sections.rows[i].amount;
        if (amount === null) {
          amount = 0;
        }
        totalContractSum += Number.parseFloat(amount);
      }
      console.log(totalContractSum);
      res.json(totalContractSum);
    } catch (error) {
      console.log(error);
    }
  },
);

router.get("/calculation/voSumFromDataEntry/:form_id", async (req, res) => {
  try {
    const { form_id } = req.params;
    const dataEntries = await pool.query(
      "SELECT variation_order FROM dataentry WHERE form_id = $1",
      [form_id],
    );
    console.log(dataEntries.rows);
    let totalContractSum = 0;
    let i = 0;
    for (i = 0; i < dataEntries.rows.length; i++) {
      let amount = dataEntries.rows[i].variation_order;
      if (amount === null) {
        amount = 0;
      }
      totalContractSum += Number.parseFloat(amount);
    }
    console.log(totalContractSum);
    res.json(totalContractSum);
  } catch (error) {
    console.log(error);
  }
});

router.get("/calculation/contractSumDataEntry/:form_id", async (req, res) => {
  try {
    const { form_id } = req.params;
    const dataEntries = await pool.query(
      "SELECT tender_sum FROM dataentry WHERE form_id = $1",
      [form_id],
    );
    console.log(dataEntries.rows);
    let totalContractSum = 0;
    let i = 0;
    for (i = 0; i < dataEntries.rows.length; i++) {
      let amount = dataEntries.rows[i].tender_sum;
      if (amount === null) {
        amount = 0;
      }
      totalContractSum += Number.parseFloat(amount);
    }
    console.log(totalContractSum);
    res.json(totalContractSum);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

```

Claims.js is contained in a 350-line file. The bloat is larger in DataEntry.js at 450-lines.

### React TanStack Complexity

Table views on the other half of the complexity sandwich look like this.

```javascript
import { evalCurrency } from "../utils";

const flatten = (obj) =>
  Object.assign(
    {},
    ...(function _flatten(o) {
      return [].concat(
        ...Object.keys(o).map((k) =>
          typeof o[k] === "object" ? _flatten(o[k]) : { [k]: o[k] },
        ),
      );
    })(obj),
  );

const morphOptionsData = (unmorphedData) => {
  const verticalCluster = unmorphedData.reduce(
    (acc, cur) => acc.concat(cur),
    [],
  );

  const formatCluster = verticalCluster.map((block) => ({
    rowId: block.dataentry_id,
    rowName: block.dataentry_name,
    tenderSum: block.tender_sum,
    workDone: block.work_done,
    totalClaim: block.total_accumulated_claim,
    prevWorkDone: block.previous_work_done,
    variationOrder: block.variation_order,
    sectionId: block.section_id,
    rowType: block.row_serial_no,
  }));

  const horizontalCluster = formatCluster.reduce((acc, cur) => {
    acc[cur.rowType] = acc[cur.rowType] || [];
    acc[cur.rowType].push(cur);
    return acc;
  }, Object.create(null));

  const withRowItem = Object.values(horizontalCluster).map((hrow) => {
    return hrow.reduce(
      (row, hset) => {
        if (!row.array) row.array = [];
        row.rowItem = hset.rowName;
        row.array.push({ ...hset });
        return row;
      },
      Object.create({ rowItem: "", array: null }),
    );
  });

  const transformedData = withRowItem.map((row) => {
    const newArray = row.array.map((innerRow) => {
      const morphedRow = Object.create(null);
      const tenderSumIdx = `tenderSum${innerRow.sectionId}`;
      const workDoneIdx = `workDone${innerRow.sectionId}`;
      const totalClaimIdx = `totalClaim${innerRow.sectionId}`;
      const prevPaymentIdx = `prevPayment${innerRow.sectionId}`;
      const variationOrderIdx = `variationOrder${innerRow.sectionId}`;

      morphedRow[tenderSumIdx] = innerRow.tenderSum;
      morphedRow[workDoneIdx] = Number.parseFloat(innerRow.workDone).toFixed(2);
      morphedRow[totalClaimIdx] =
        (innerRow.tenderSum * innerRow.workDone) / 100;
      morphedRow[prevPaymentIdx] =
        (innerRow.tenderSum * innerRow.prevWorkDone) / 100;
      morphedRow[variationOrderIdx] = Number.parseFloat(
        innerRow.variationOrder,
      ).toFixed(2);
      morphedRow.rowType = innerRow.rowType;
      morphedRow.rowId = innerRow.rowId;
      return morphedRow;
    });
    const flattenArray = flatten(newArray);
    return { rowItem: row.rowItem, ...flattenArray };
  });

  return transformedData;
};

const _calculateTotalClaim = ({ sectionId, r }) => {
  const tenderSumKey = new RegExp(`^tenderSum${sectionId}`);
  const workDoneKey = new RegExp(`^workDone${sectionId}`);
  const tenderSum = Object.entries(r).find(([key, _value]) =>
    tenderSumKey.test(key),
  )[1];
  const workDone = Object.entries(r).find(([key, _value]) =>
    workDoneKey.test(key),
  )[1];
  return (tenderSum * workDone) / 100;
};

const accessorTotal = ({ regex, r }) => {
  let total = 0.0;
  const regexKey = new RegExp(regex);
  Object.entries(r).forEach(([key, value]) => {
    if (regexKey.test(key)) total += Number.parseFloat(value);
  });
  return total;
};

const simpleColumn = ({ Header, accessor, width, sticky }) => {
  return {
    Header,
    accessor,
    sticky,
    style: {
      width,
    },
  };
};

const stackedColumn = ({ titleStack, simpleColumns, sticky, id }) => ({
  ...simpleColumn({
    Header: titleStack,
    // width: "2000px",
  }),
  columns: simpleColumns,
  sticky,
  id,
});

const lowerStack = (sectionId) => [
  simpleColumn({
    Header: "Tender Sum",
    accessor: `tenderSum${sectionId}`,
    width: "50",
  }),
  simpleColumn({
    Header: "Work Done",
    accessor: `workDone${sectionId}`,
    width: "50",
  }),
  simpleColumn({
    Header: "Total Claim",
    accessor: `totalClaim${sectionId}`,
    width: "50",
  }),
  simpleColumn({
    Header: "Variation Order",
    accessor: `variationOrder${sectionId}`,
    width: "50",
  }),
];

const morphOptionsHeader = (sections, sticky) => {
  const variableOptions = sections.map((s) => {
    return stackedColumn({
      titleStack: s.section_heading,
      simpleColumns: lowerStack(s.section_id),
    });
  });

  const stickyState = sticky ? "right" : "none";

  const optionsHeaderBuilder = (options, sticky) => [
    stackedColumn({
      id: "item",
      titleStack: " ",
      simpleColumns: [
        simpleColumn({
          Header: "Item",
          accessor: "rowItem",
          width: "150",
          sticky: "left",
        }),
      ],
      sticky: "left",
    }),
    ...options,
    stackedColumn({
      id: "summary",
      titleStack: "Summary",
      simpleColumns: [
        simpleColumn({
          Header: "All Tender Sum",
          accessor: (r) =>
            evalCurrency(accessorTotal({ regex: "^tenderSum", r })),
          sticky: sticky,
          width: "100",
        }),
        simpleColumn({
          Header: "All Accumulated Claims",
          accessor: (r) =>
            evalCurrency(accessorTotal({ regex: "^totalClaim", r })),
          sticky: sticky,
          width: "100",
        }),
        simpleColumn({
          Header: "All Variation Orders",
          accessor: (r) =>
            evalCurrency(accessorTotal({ regex: "^variationOrder", r })),
          sticky: sticky,
          width: "100",
        }),
        simpleColumn({
          Header: "Previous Payments",
          accessor: (r) =>
            evalCurrency(accessorTotal({ regex: "^prevPayment", r })),
          sticky: sticky,
          width: "100",
        }),
        simpleColumn({
          Header: "This Claim",
          accessor: (r) =>
            evalCurrency(
              accessorTotal({ regex: "^totalClaim", r }) -
              accessorTotal({ regex: "^prevPayment", r }),
            ),
          sticky: sticky,
          width: "100",
        }),
      ],
      sticky: sticky,
    }),
  ];

  return optionsHeaderBuilder(variableOptions, stickyState);
};

export { morphOptionsData, morphOptionsHeader };

```

## Big picture

We built two client-server systems to support the company's internal and external project management processes. Frontend is in React libraries while backend serves an Express.js restful API with a connection to postgresql. React was a natural choice to build modern components, especially coming from Java Enterprise, Bootstrap UI coursework.

Here is a mock up of one type of form, and the interface of another type of form.![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731140374/posts/file_salbnu.png)Above is the internal system of type-A forms.

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731140396/posts/file_xb4rb1.png)Above is the external system of type-R forms.

A fair amount of sections of data grouped by "project items" such as "Preliminary work and handling" and "excavation work". Each section is accompanied by the price, weights and progress of work.

### Forms and tables can be painful

Creating forms is a process to make it easier for users to input data. This means we want:

* data loss prevented on page refresh
* ease of data entry
* see important information at a glance
* mistake reversal

React-table features we implemented are editable and dynamic fields, so the user can operate similarly to Microsoft Excel.

React-table also had some nice features that we did not implement, such as filter and sort by columns. It allowed for very interactive tables.

## Learning

I have a grown appreciation of structures to keep project growth linear. Simplify in steps, each step carved to accomodate space for project growth.

On management of complexity, I have seen how complexity can affect projects over time to produce bloat, which leads to bigger and slower builds. Changes become more difficult to implement due to bloat and bad code organisation. Noise in warnings pile up and errors go unnoticed until things eventually break.

On management of delegating and splitting work, drawing clear lines and shaping team values is important to steer the project forward. We lost some time to git management, redesigning frontend state management, revisiting the API and schema to make adjustments, and just a lot of documents and meetings.

We even had to take 2 weeks off close to launch and exams to furnish a 500-page report with class, sequence, use case diagrams.

## Other media

Non-primary responsibilities

### Database schema

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731140379/posts/file_ejwb1t.jpg)

### Dockerisation to abstract development environment

#### docker-compose.yml

```dockerfile
version: '3.8'
services:
  # Database service
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_DB: emservices
      POSTGRES_USER: h
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./emservices-internal/server/scripts:/docker-entrypoint-initdb.d/
    networks:
      - mynetwork
    expose:
      - 5432

  # Internal server
  internal_server:
    build:
      context: ./emservices-internal/server
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    networks:
      - mynetwork
    volumes:
      - ./emservices-internal/server:/app
      - /app/node_modules

  # Internal client
  internal_client:
    build:
      context: ./emservices-internal/client
    ports:
      - "3000:3000"
    depends_on:
      - internal_server
    networks:
      - mynetwork
    volumes:
      - ./emservices-internal/client:/app
      - /app/node_modules

  # External server
  external_server:
    build:
      context: ./emservices-external/server
    ports:
      - "5001:5001"
    depends_on:
      - postgres
    networks:
      - mynetwork
    volumes:
      - ./emservices-external/server:/app
      - /app/node_modules

  # External client
  external_client:
    build:
      context: ./emservices-external/client
    ports:
      - "3001:3001"
    depends_on:
      - external_server
    networks:
      - mynetwork
    volumes:
      - ./emservices-external/client:/app
      - /app/node_modules

networks:
  mynetwork:
    driver: bridge

volumes:
  postgres_data:


```

#### Dockerfile for each server and each client, this is Internal Server

```dockerfile

FROM --platform = linux / amd64 node: 12

# Install nodemon and node - pre - gyp globally
RUN npm install - g nodemon node - pre - gyp 
RUN npm rebuild bcrypt--build - from - source

# Set the working directory
WORKDIR / app

# Copy the package files and install dependencies
COPY package *.json./
  RUN npm install

# Copy the rest of the application code
COPY. .

# Expose port for internal server
EXPOSE 5000

# Command to run the server
CMD["npm", "start"]


```
