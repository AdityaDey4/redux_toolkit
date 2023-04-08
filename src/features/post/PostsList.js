import { useSelector } from "react-redux";
import { selectAllPosts, getPostStatus, getPostError } from "./postSlice";

import PostExcerpt from "./PostExcerpt";

const PostsList = () => {

    const posts = useSelector(selectAllPosts);
    const postStatus = useSelector(getPostStatus);
    const postError = useSelector(getPostError);

    // useEffect(()=> {
    //     if(postStatus === "idle") {
    //         dispatch(fetchPosts());
    //     }
    // }, [postStatus, dispatch]);

    let content;
    if(postStatus === "loading") {
        content = <p>Loading......</p>
    } 
    else if(postStatus === "succeeded") {
        const orderedPosts = posts.slice().sort((a, b)=> b.date.localeCompare(a.date));
        content = orderedPosts.map(post=> <PostExcerpt key={post.id} post={post} />);
    } 
    else if(postStatus === "failed") {
        content = <p>{postError}</p>
    }
  return (
    <section>
        {content}
    </section>
  )
}

export default PostsList;