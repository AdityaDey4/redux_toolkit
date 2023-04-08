import { useSelector } from "react-redux";
import { selectPostById } from "./postSlice";
import { useParams, Link } from "react-router-dom";

import PostAuthor from "./PostAuthor";
import TimeAgo from "./TimeAgo";
import ReactionButtons from "./ReactionButtons";

const SinglePostPage = () => {

    const { postId } = useParams();
    const post = useSelector((state)=> selectPostById(state, Number(postId)));

    if(!post) {
        return (

            <section>
                <h2>Post Not Found</h2>
            </section>
        )
    }

    return (

        <article>
            <h1>{post.title}</h1>
            <p>{post.body}</p>
            <p className="postCredit">
                <Link to={'/post/edit/'+post.id}>Edit Post</Link>
                <PostAuthor userId={post.userId} />
                <TimeAgo timestamp={post.date} />
            </p>
            <ReactionButtons post={post} />
        </article>
    )
}

export default SinglePostPage;