# ShakeSearch

Welcome to the Pulley Shakesearch Take-home Challenge! In this repository,
you'll find a simple web app that allows a user to search for a text string in
the complete works of Shakespeare.

You can see a live version of the app at
https://pulley-shakesearch.onrender.com/. Try searching for "Hamlet" to display
a set of results.

In it's current state, however, the app is in rough shape. The search is
case sensitive, the results are difficult to read, and the search is limited to
exact matches.

## Your Mission

Improve the app! Think about the problem from the **user's perspective**
and prioritize your changes according to what you think is most useful.

You can approach this with a back-end, front-end, or full-stack focus.

## Evaluation

We will be primarily evaluating based on how well the search works for users. A search result with a lot of features (i.e. multi-words and mis-spellings handled), but with results that are hard to read would not be a strong submission.

## Submission

I first took some time to learn GO which was easier than I expected and I started to quite enjoy the development flow, the VSCode plugin made things a lot easier to get up and started with like testing and linting.

With the backend I focused on adding some simple mechanisms like caching 1st to improve response time for common queries. Used an LRU cache library and if building more robust would use Redis. I also added fuzzy matching to return results in case a user mispelled a query such as "Macbth". Spent most of the API code time on determining the best way to go about using both exact and fuzzies matches settling upoin only doing a fuzzy search if no exact match found. The exact match too, is case insensistive allowing using to use uppercase in queries.

On the client I chose to use Vite with React, RxJs and Typescript. I initialy had to setup Air to get hot reloading of the server which took some time. I also by virtue of the turorial I found used Echo for the server cause it was guide on integrating a react project with GO. Back to the client I organized the code in a manner to seperate logic/data from components with a hooks and components folder. I used RxJs to handle search input in a nice and cohesive way using observables which made logic flow really easy to reason about and easy to iterate and add new features. I added some predefined query such as Hamlet to use and also enabled user to save queries to use for later (some issue at times with indexedDB perisiting but solvable). When viewing results users can trigger a modal to focus on one and get a more accesbile text to read. There's also light and dark mode to make it easy on the eyes at night when searching through matches.

Some improvements I would make woulde be to improve the performance of the API by introducing pagination (spent time trying to add but ran into issues on the client side with infinite scrolling). Possibly add some more body validation for security purposes though very low attack surface if any. On the client I would polish the UI and add accesibliity features for screen readers and such. Also possibly add a sharing functionality so users canshare there favorite excerpts. Add a custom theme for different holidays so people return if just for that and also do something for shakespeare birthday like the logo flying around the screen similar to Google logo animations for celebrations. Login functionaliy using a federated provider or Web3 so users can associated saved data across device.

All in all had a great time creating a fun UI, learning GO and will defintely be using it for projects going forward.
