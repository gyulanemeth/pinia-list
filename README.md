# pinia-list-store

Optimistic / pessimistic
metaFirst

Usage:
```
import createLoad from 'pinia-list-store/src/actions/load.js'
```
etc...

## Item statuses

list:
 - ready
 - loading-in-progress
 - loading-more-in-progress
 - encountered-an-error

list items:
 - ready
 - loading-in-progress
 - creation-in-progress
 - update-in-progress
 - patch-in-progress
 - delete-in-progress
 - encountered-an-error


## Upcoming features
 - paged list support
 - indexed db cache
 - special error handling for notfound cases
