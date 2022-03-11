# JS Raycaster
A [Wolfenstein 3D](https://en.wikipedia.org/wiki/Wolfenstein_3D) inspired [raycaster](https://en.wikipedia.org/wiki/Ray_casting#Ray_casting_in_early_computer_games).

<center>
	<br/>
	<img src=".github/screenshot01.png"/>
</center>

[Live demo here](https://leandrosq.github.io/js-raycaster/)

## Stack
| Name | Description |
| -- | -- |
| Typescript / Tsify | For type-safe coding, compiles to JS |
| Babel / Babelify | For cross-browser compatibility, compiles JS into retro-compatible JS |
| Eslint | For linting and semantic analysis |
| Browserify | For bundling JS files |
| Sass | Superset of CSS |
| Gulp | For building tooling |
| Pure HTML5 Canvas API | For graphics |
| Github actions | For CI, building and deploying to github pages |

## Building sources

- `yarn install` to install dependencies
- `gulp build` to build sources
- Open the `index.html` file at `/dist/index.html`

For dev environment, you can use `gulp dev` to run the server and live reload on changes.
