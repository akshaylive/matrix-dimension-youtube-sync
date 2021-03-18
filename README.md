# Matrix Dimension Youtube Sync Widget

Watch videos together without having to synchronize! Let this widget do it for you.

# Development

1. `yarn`: Installs dependencies
1. `yarn dev`: Starts the development server. This comes with file watcher. Any server changes would need a manual restart.
1. `yarn build`: Builds the production server.
1. `yarn start`: Starts the production server.

# How to use?

1. Add a custom matrix-dimension widget and point it to your server using this URL format: `https://host:port/?roomId=$matrix_room_id`
1. Let both the parties open the widget.
1. Hover on top of the screen to see an input box. Paste your youtube URL there and hit enter.
1. This should automatically open the video for all the parties connected.
1. Any person connected to the room should be able to play, pause or change URL, and the state will be replicated across all parties.

# How does this work?

1. When a URL such as `https://host:port/?roomId=$matrix_room_id` is opened, the React front end will connect to a socketio instance and subscribe to messages for the room.
1. The server does nothing but forward play and pause messages between all parties in the room.
1. Every 5 seconds, a sync message is sent so new participants can begin to synchronize.
1. When a play or pause message is received, the youtube player is controlled.
1. If the video is already being played and a sync message is received, the video will NOT seek to that position. This is done to have a smoother experience. 
   The video timestamp changes ONLY if new position is more than or less than 3 seconds from current video position. This could be extracted to an ENV variable. 

# TODO

1. Allow ability to configure the server via env variables
1. ... and Docker-ize this
1. NextJS was used to quickly bootstrap this project. The benefits of using NextJS is not really required. 
   It's easier to manage this project using only React, Express and Socketio. Please refactor.
   TBH even React is not required but could come in handy if moderation is introduced.
1. The React state management could be better.
1. Various playback rates are currently not supported.
1. Add tests

# Known issues:

1. On localhost, autoplay does not work with audio. If you face this, add permissions to autoplay on your favorite browser.
1. This hasn't been tested with larger rooms, but has been tested with only two people in the room. Sync message moderation may be required for larger rooms.
