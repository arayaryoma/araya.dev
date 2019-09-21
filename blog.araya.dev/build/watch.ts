import {series, watch} from 'gulp';
import {build, buildTemplates, bundle, copyAssets, copyStyles} from "./gulpfile";

series(build, () => {
    watch(['../templates/**/*', '../posts/**/*'], series(buildTemplates));
    watch(['../styles/**/*'], series(copyStyles));
    watch(['../assets/**/*'], series(copyAssets));
    watch(['../js/**/*'], series(bundle));
});
