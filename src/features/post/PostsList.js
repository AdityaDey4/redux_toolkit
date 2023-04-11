import { useSelector } from "react-redux";
import { selectPostIds, getPostStatus, getPostError } from "./postSlice";

import PostExcerpt from "./PostExcerpt";

const PostsList = () => {

    const orderedPostIds = useSelector(selectPostIds);
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
        content = orderedPostIds.map(postId=> <PostExcerpt key={postId} postId={postId} />);
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