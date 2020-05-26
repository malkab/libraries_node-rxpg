# Building the Library

Follow these steps:

-   build the library by running **build-library.sh** script. This will
    both build the library and its documentation;

-   then test the package by running **npm pack**. Test the compressed
    file and modify the **.npmignore** file as needed;

-   when done, **npm login** if needed and **npm publish** (check
    carefully the context at **package.json** if a private repo).
