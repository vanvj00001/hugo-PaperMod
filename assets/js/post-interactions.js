(function () {
    const root = document.querySelector("[data-post-interactions]");
    if (!root) {
        return;
    }

    const storageKey = root.dataset.storageKey;
    const hasLiveComments = root.dataset.liveComments === "true";
    const defaultState = {
        followers: 1,
        likes: 0,
        liked: false,
        comments: []
    };

    const followersCount = root.querySelector("[data-followers-count]");
    const likesCount = root.querySelector("[data-likes-count]");
    const commentsCount = root.querySelector("[data-comments-count]");
    const likeButton = root.querySelector("[data-like-button]");
    const commentToggle = root.querySelector("[data-comment-toggle]");
    const commentBox = root.querySelector("[data-comment-box]");
    const commentForm = root.querySelector("[data-comment-form]");
    const commentsList = root.querySelector("[data-comments-list]");

    function loadState() {
        try {
            const raw = localStorage.getItem("post-interactions:" + storageKey);
            if (!raw) {
                return { ...defaultState };
            }

            const parsed = JSON.parse(raw);
            return {
                followers: typeof parsed.followers === "number" ? parsed.followers : defaultState.followers,
                likes: typeof parsed.likes === "number" ? parsed.likes : defaultState.likes,
                liked: Boolean(parsed.liked),
                comments: Array.isArray(parsed.comments) ? parsed.comments : defaultState.comments
            };
        } catch (error) {
            return { ...defaultState };
        }
    }

    let state = loadState();

    function saveState() {
        localStorage.setItem("post-interactions:" + storageKey, JSON.stringify(state));
    }

    function formatDate(value) {
        try {
            return new Date(value).toLocaleString();
        } catch (error) {
            return "";
        }
    }

    function renderComments() {
        commentsList.innerHTML = "";

        if (!state.comments.length) {
            const empty = document.createElement("p");
            empty.className = "post-interactions__empty";
            empty.textContent = "还没有留言，来写第一条。";
            commentsList.appendChild(empty);
            return;
        }

        state.comments
            .slice()
            .reverse()
            .forEach((comment) => {
                const item = document.createElement("article");
                item.className = "post-interactions__comment";

                const meta = document.createElement("div");
                meta.className = "post-interactions__comment-meta";

                const author = document.createElement("strong");
                author.textContent = comment.name || "访客";

                const date = document.createElement("span");
                date.textContent = formatDate(comment.createdAt);

                const body = document.createElement("p");
                body.className = "post-interactions__comment-body";
                body.textContent = comment.message;

                meta.appendChild(author);
                meta.appendChild(date);
                item.appendChild(meta);
                item.appendChild(body);
                commentsList.appendChild(item);
            });
    }

    function render() {
        followersCount.textContent = String(state.followers);
        likesCount.textContent = String(state.likes);
        if (commentsCount) {
            commentsCount.textContent = String(state.comments.length);
        }
        likeButton.dataset.active = state.liked ? "true" : "false";
        if (!hasLiveComments) {
            renderComments();
        }
    }

    root.querySelector("a.post-interactions__button").addEventListener("click", function () {
        state.followers += 1;
        saveState();
        render();
    });

    likeButton.addEventListener("click", function () {
        if (state.liked) {
            state.likes = Math.max(0, state.likes - 1);
            state.liked = false;
        } else {
            state.likes += 1;
            state.liked = true;
        }

        saveState();
        render();
    });

    commentToggle.addEventListener("click", function () {
        if (hasLiveComments) {
            const comments = document.getElementById("comments");
            if (comments) {
                comments.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            return;
        }

        const isHidden = commentBox.hasAttribute("hidden");
        if (isHidden) {
            commentBox.removeAttribute("hidden");
            const message = commentForm.querySelector("textarea[name='message']");
            if (message) {
                message.focus();
            }
        } else {
            commentBox.setAttribute("hidden", "");
        }
    });

    if (commentForm) {
        commentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(commentForm);
        const name = String(formData.get("name") || "").trim();
        const message = String(formData.get("message") || "").trim();

        if (!message) {
            return;
        }

        state.comments.push({
            name: name || "访客",
            message: message,
            createdAt: new Date().toISOString()
        });

        saveState();
        commentForm.reset();
        render();
    });
    }

    render();
})();
