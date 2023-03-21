import { useSelector } from "react-redux";
import { selectAllPosts } from "./postSlice";
import PostAuthor from "./PostAuthor";
import TimeAgo from "./TimeAgo";
import ReactionButtons from "./ReactionButtons";

const PostsList = () => {

    const posts = useSelector(selectAllPosts);

    const orderedPosts = posts.slice().sort((a, b)=> b.date.localeCompare(a.date));

    const renderedPosts = orderedPosts.map(post=> (
        <article key={post.id}>
            <h1>{post.title}</h1>
            <p>{post.content.substring(0, 100)}</p>
            <p className="postCredit">
                <PostAuthor userId={post.userId} />
            </p>
            <TimeAgo timestamp={post.date} />
            <ReactionButtons post={post} />
        </article>
    ))
  return (
    <section>
        <h2>Posts</h2>
        {renderedPosts}
    </section>
  )
}

export default PostsList;