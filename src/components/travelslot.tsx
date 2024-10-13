import React, { useEffect } from 'react'
import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { type TravelsQuery } from "../../tina/__generated__/types";

import { breadcrumbPosition, titlePosition } from '../store/titleStore'

export const TravelComponent = (props: {
    data: TravelsQuery,
    variables: {
        relativePath: string
    },
    query: string,
}) => {
    const { data } = useTina(props);

    const { title } = data.travels;

    return (
        <>
            <div className="p-8 space-y-8 pb-48 lg:pb-24">
                <h1
                    className="travel-title font-serif text-4xl font-bold mb-6"
                    data-tina-field={tinaField(data.travels, 'title')}
                >
                    {title}
                </h1>
                <div 
                  data-tina-field={tinaField(data.travels, 'body')}
                >
                    <TinaMarkdown content={data.travels.body} />
                </div>
                <article />
            </div>
        </>
    );
};
