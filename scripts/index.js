// URLs
const API_ENDPOINT = "http://localhost:3000";
const TWEETS_URL = `${API_ENDPOINT}/tweets`;

// API functions

const getTweetsErrorMessage = "Oops! Can't get tweets! Is the backend down?";
const getTweets = () =>
  fetch(TWEETS_URL)
    .then(res => {
      if (res.ok) return res.json();
      else throw getTweetsErrorMessage;
    })
    .catch(e => {
      throw getTweetsErrorMessage;
    });

const postTweet = content =>
  fetch(TWEETS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      content,
      retweets: 0,
      likes: 0,
      replies: 0
    })
  }).then(res => res.json());

const deleteTweet = tweet =>
  fetch(`${TWEETS_URL}/${tweet.id}`, {
    method: "DELETE"
  });

const patchTweet = tweet =>
  fetch(`${TWEETS_URL}/${tweet.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(tweet)
  }).then(res => res.json());

// DOM Elements

const newTweetForm = document.querySelector("#new-tweet");
const tweetsContainer = document.querySelector("#tweets");

// Event listeners + handlers

newTweetForm.addEventListener("submit", e => {
  e.preventDefault();
  const tweetContent = e.target.elements.content.value;
  postTweet(tweetContent).then(tweet => {
    renderTweet(tweet, true);
    e.target.reset();
  });
});

const increaseTweetValue = (tweet, key, button) => {
  tweet[key]++;
  patchTweet(tweet).then(tweet => {
    button.innerText = `${tweet[key]} ${key}`;
  });
};

const addLike = (tweet, button) => increaseTweetValue(tweet, "likes", button);

const addReply = (tweet, button) =>
  increaseTweetValue(tweet, "replies", button);

const addRetweet = (tweet, button) =>
  increaseTweetValue(tweet, "retweets", button);

// Render functions

const renderTweets = tweets => {
  tweets.forEach(tweet => {
    renderTweet(tweet);
  });
};

const renderTweet = (tweet, before = false) => {
  const tweetDiv = document.createElement("div");
  tweetDiv.className = "tweet";

  const content = document.createElement("p");
  content.innerText = tweet.content;

  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "buttons";

  const repliesButton = document.createElement("button");
  repliesButton.innerText = `${tweet.replies} replies`;
  repliesButton.addEventListener("click", () => addReply(tweet, repliesButton));

  const likesButton = document.createElement("button");
  likesButton.innerText = `${tweet.likes} likes`;
  likesButton.addEventListener("click", () => addLike(tweet, likesButton));

  const retweetsButton = document.createElement("button");
  retweetsButton.innerText = `${tweet.retweets} retweets`;
  retweetsButton.addEventListener("click", () =>
    addRetweet(tweet, retweetsButton)
  );

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "x";
  deleteButton.className = "delete";
  deleteButton.addEventListener("click", () => {
    deleteTweet(tweet);
    tweetDiv.remove();
  });

  buttonsDiv.append(repliesButton, likesButton, retweetsButton, deleteButton);

  tweetDiv.append(content, buttonsDiv);

  if (before) tweetsContainer.prepend(tweetDiv);
  else tweetsContainer.append(tweetDiv);
};

// GO!
getTweets()
  .then(tweets => {
    tweets.sort((tweetA, tweetB) => tweetB.id - tweetA.id);
    renderTweets(tweets);
  })
  .catch(message => {
    tweetsContainer.innerText = message;
    tweetsContainer.className = "error";
  });
