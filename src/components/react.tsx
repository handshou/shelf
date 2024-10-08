import React from 'react'
import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import '../styles/global.css'
import { type ProjectsQuery } from '../../tina/__generated__/types';

export const ProjectComponent = (props: {
    data: ProjectsQuery,
    query: string,
    variables: {
        relativePath: string
    },
}) => {
    const { data } = useTina(props);

    const { title, pubDate: unPubDate } = data.projects;

    const LocaleConfig: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }
    const pubDate =	new Date(unPubDate as string)
      .toLocaleDateString('en-US', LocaleConfig)

    return (
        <>
            <h1 
              data-tina-field={tinaField(data.projects, 'title')}
              className="title" 
            >
              {title}
            </h1>
            {pubDate && 
              <time 
                data-tina-field={tinaField(data.projects, 'pubDate')} 
                dateTime="MMM-DD-YYYY"
              >
                {pubDate}
              </time>}
            <hr />
            <div 
              data-tina-field={tinaField(data.projects, 'body')}
            >
              <TinaMarkdown 
                content={data.projects.body} 
              />
            </div>
        </>
    );
};
