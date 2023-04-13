import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import { apiSlice } from "../api/apiSlice";

const postAdapter = createEntityAdapter({
    sortComparer : (a, b)=> b.date.localeCompare(a.date)
})

const initialState = postAdapter.getInitialState()

export const extendedApiSlice = apiSlice.injectEndpoints({
    endpoints : (builder)=> ({
        
        getPosts : builder.query({
            query : ()=> "/posts",
            transformResponse : (responseData)=> {

                let min = 1;
                const loadedPost = responseData.map(post=> {
                    if(!post.date) post.date = sub(new Date(), {minutes : min++}).toISOString();
                    if(!post.reactions) post.reactions = {
                        thumbsup : 0, 
                        wow : 0, 
                        heart : 0,
                        rocket : 0,
                        coffee : 0
                    }

                    return post;
                })
                return postAdapter.setAll(initialState, loadedPost);
            },
            providesTags : (result, error, arg) => [
                {type : "Post", id : "LIST"},
                ...result.ids.map(id=> ({type : "Post", id}))
            ]
        }),
        getPostsByUserId : builder.query({
            query : (id)=> "/posts/?userId="+id,
            transformResponse : (responseData)=> {
                let min = 1;
                const loadedPost = responseData.map(post=> {
                    if(!post.date) post.date = sub(new Date(), {minutes : min++}).toISOString();
                    if(!post.reactions) post.reactions = {
                        thumbsup : 0, 
                        wow : 0, 
                        heart : 0,
                        rocket : 0,
                        coffee : 0
                    }

                    return post;
                })
                return postAdapter.setAll(initialState, loadedPost);
            },
            providesTags : (result, error, arg)=> [
                ...result.ids.map(id => ({ type: 'Post', id }))
            ]
        }),
        addNewPost : builder.mutation({
            query : (initialPost)=>({
                url : "/posts",
                method : "POST",
                body : {
                    ...initialPost,
                    userId : Number(initialPost.userId),
                    date : new Date().toISOString(),
                    reactions : {
                        thumbsup : 0, 
                        wow : 0, 
                        heart : 0,
                        rocket : 0,
                        coffee : 0
                    }
                }
            }),
            invalidatesTags : [{type : "Post", id : "LIST"}]
        }),
        updatePost : builder.mutation({
            query : (initialPost)=> ({
                url : "/posts/"+initialPost.id,
                method : "PUT",
                body : {
                    ...initialPost, 
                    date : new Date().toISOString()
                }
            }),
            invalidatesTags :(result, error, arg)=>  [{type : "Post", id : arg.id}] // here arg contains the specific post
        }),
        deletePost : builder.mutation({
            query : ({id})=> ({
                url : '/posts/'+id,
                method : "DELETE",
                body : {id}
            }),
            invalidatesTags : (result, error, arg)=> [{type : "Post", id : arg.id}]
        }),
        addReaction : builder.mutation({
            query : ({postId, reactions})=> ({
                url : "/posts/"+postId,
                method : 'PATCH',
                body : {reactions}
            }),
            async onQueryStarted({postId, reactions}, {dispatch, queryFulfilled}) {

                const patchResult = dispatch(
                    extendedApiSlice.util.updateQueryData('getPosts', undefined, draft=> {
                        const post = draft.entities[postId]
                        if(post) post.reactions = reactions;
                    })
                )

                try {
                    await queryFulfilled
                }catch(err) {
                    patchResult.undo();
                }
            }
        })
    })
})

export const {  
    useGetPostsQuery,
    useGetPostsByUserIdQuery,
    useAddNewPostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useAddReactionMutation
} = extendedApiSlice;

//returns the query result object
export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select();

// creates memoized selectors
const selectPostsData = createSelector(

    // input function
    selectPostsResult,
    //output function
    postResult=> postResult.data
)

export const {
    selectAll : selectAllPosts,
    selectById : selectPostById,
    selectIds : selectPostIds
} = postAdapter.getSelectors(state=> selectPostsData(state) ?? initialState);