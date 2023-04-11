import { createSlice, createAsyncThunk, createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import axios from "axios";

const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";
let idCount = 1;
const postAdapter = createEntityAdapter({
    sortComparer : (a, b)=> b.date.localeCompare(a.date)
})

// we can get posts as state.entities
const initialState = postAdapter.getInitialState({
    status : "idle", // idle | loading | succeeded | failed
    error : null, 
    count : 0
})

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async() => {
    try {
        const responce = await axios.get(POSTS_URL);
        return responce.data;
    }catch(err) {
        return err.message;
    }
})

export const addNewPost = createAsyncThunk('posts/addNewPost', async (initialPost)=> {
    try {
        const response = await axios.post(POSTS_URL, initialPost);
        return response.data;
    }catch(err) {
        return err.message;
    }
})

export const updatePost = createAsyncThunk("posts/updatePost", async(initialPost)=> {

    const { id } = initialPost;
    try {
        const response = await axios.put(POSTS_URL+'/'+id, initialPost);
        return response.data;
    }catch(err) {
        return err.message;
    }
})

export const deletePost = createAsyncThunk("posts/deletePost", async (initialPost)=> {

    const {id} = initialPost;
    try {
        const response = await axios.delete(POSTS_URL+'/'+id);
        if(response.status === 200) return initialPost;
        return response.status+" : "+response.statusText;
    }catch(err) {
        return err.message;
    }
})
const postSlice = createSlice({
    name : "posts",
    initialState,
    reducers : {
        reactionsAdded(state, action) {
            const {postId, reaction} = action.payload;
            const existingPost = state.entities[postId];

            if(existingPost) {
                existingPost.reactions[reaction]++;
                console.log(reaction);
            }
        },
        increaseCount(state, action) {
            state.count++;
        }
    },
    extraReducers(builder) {
        builder 
            .addCase(fetchPosts.pending, (state, action)=> {
                state.status = "loading";
            })
            .addCase(fetchPosts.fulfilled, (state, action)=> {
                state.status = "succeeded";

                // Adding date & reactions
                let min = 1;
                const loadedPosts = action.payload.map(post => {
                    post.date = sub(new Date(), {minutes: min++}).toISOString();
                    post.reactions = {
                        thumbsUp : 0,
                        wow : 0,
                        heart : 0,
                        rocket : 0,
                        coffee : 0
                    }

                    return post;
                });

                postAdapter.upsertMany(state, loadedPosts);
            })
            .addCase(fetchPosts.rejected, (state, action)=> {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(addNewPost.fulfilled, (state, action)=> {
                
                action.payload.id = state.ids[state.ids.length-1]+idCount++;
                action.payload.userId = Number(action.payload.userId)
                action.payload.date = new Date().toISOString();
                action.payload.reactions = {
                    thumbsUp: 0,
                    wow: 0,
                    heart: 0,
                    rocket: 0,
                    coffee: 0
                }

                // total ids will remain same even though we add new posts
                console.log(state.ids[state.ids.length-1]);
                postAdapter.addOne(state, action.payload);
            })
            .addCase(updatePost.fulfilled, (state, action)=> {

                if(!action.payload?.id) {
                    console.log("Update Could not complete");
                    console.log(action.payload);
                    return;
                }
                action.payload.date = new Date().toISOString();
                postAdapter.upsertOne(state, action.payload);
            })
            .addCase(deletePost.fulfilled, (state, action)=> {

                if(!action.payload?.id) {
                    console.log("Delete Could not complete");
                    console.log(action.payload);
                    return;
                }

                const {id} = action.payload;
                postAdapter.removeOne(state, id);
            })
    }
})

export const {
    selectAll : selectAllPosts,
    selectById : selectPostById,
    selectIds : selectPostIds
} = postAdapter.getSelectors(state=> state.posts);

export const getPostStatus = (state)=> state.posts.status;
export const getPostError = (state)=> state.posts.error;
export const getCount = (state)=> state.posts.count;

export const selectPostsByUser = createSelector(
    [selectAllPosts, (state, userId)=> userId],
    (posts, userId)=> posts.filter(post=> post.userId === userId)
)

export const { increaseCount, reactionsAdded } = postSlice.actions;
export default postSlice.reducer;