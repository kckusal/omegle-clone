## Notes

- There is a `shared-types.ts` file in the backend/ and frontend/ directory each which is just a symlink to the `types.ts` file in the root directory (the symlink was created with command `ln -s ../shared-types.ts ./shared-types.ts` inside /backend for example). This allows us to locally reference the shared-types file in root folder as if the file is inside the app directory; then properly copying inside Dockerfile from root context helps maintain references.
