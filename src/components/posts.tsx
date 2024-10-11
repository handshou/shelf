import React from "react"
import { useTina, tinaField } from "tinacms/dist/react"
import { TinaMarkdown } from "tinacms/dist/rich-text"
import { type PostsQuery } from "../../tina/__generated__/types"

export const PostComponent = (props: {
    data: PostsQuery,
    variables: {
        relativePath: string
    },
    query: string,
}) => {
    const { data } = useTina(props);

	const { title, pubDate: unPubDate, updatedDate } = data.posts;

    const pubDate = new Date(unPubDate).toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

    return (
        <>
            <h1 
              className="title"
              data-tina-field={tinaField(data.posts, "title")}
            >
              {title}
            </h1>
            {pubDate && 
              <time 
                dateTime="MMM-DD-YYYY"
                data-tina-field={tinaField(data.posts, "pubDate")}
              >
                {pubDate}
              </time>
            }
            <hr />
            <div
              data-tina-field={tinaField(data.posts, "body")}
            >
              <TinaMarkdown content={data.posts.body} />
            </div>
        </>
    );
};
