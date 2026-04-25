<template>
    <div class="comments-wrapper">
        <div class="field is-grouped">
            <slot name="controls"
                :create="create"
                :internal-query="internalQuery"
                :fetch="fetch">
                <p class="control">
                    <a class="button is-small is-dark"
                        @click="create()">
                        <span v-if="!compact">
                            {{ i18n('Add') }}
                        </span>
                        <span class="icon">
                            <fa :icon="faPlus"/>
                        </span>
                    </a>
                </p>
                <p class="control has-icons-left has-icons-right is-expanded">
                    <input v-model="internalQuery"
                        class="input is-small is-expanded"
                        type="text"
                        :placeholder="i18n('Filter')">
                    <span class="icon is-small is-left">
                        <fa :icon="faSearch"/>
                    </span>
                    <span v-if="internalQuery"
                        class="icon is-small is-right clear-button is-clickable"
                        @click="internalQuery = ''">
                        <a class="delete is-small"/>
                    </span>
                </p>
                <p class="control">
                    <a class="button is-small"
                        @click="fetch()">
                        <span v-if="!compact">
                            {{ i18n('Reload') }}
                        </span>
                        <span class="icon">
                            <fa :icon="faArrowsRotate"/>
                        </span>
                    </a>
                </p>
            </slot>
        </div>
        <div class="comments p-3">
            <comment v-if="comment"
                :id="id"
                is-new
                :type="type"
                :comment="comment"
                :index="-1"
                @cancel-add="comment = null"
                @save="add"/>
            <comment v-for="(filteredComment, index) in filteredComments"
                :key="filteredComment.id"
                :comment="filteredComment"
                :index="index"
                :human-readable-dates="humanReadableDates"
                @save="update(filteredComment)"
                @delete="destroy(index)"/>
        </div>
    </div>
</template>

<script>
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
import { faPlus, faArrowsRotate, faSearch } from '@fortawesome/free-solid-svg-icons';
import { app } from '@enso-ui/ui/src/pinia/app';
import Comment from './Comment.vue';

export default {
    name: 'Comments',

    components: { Fa, Comment },

    inject: ['errorHandler', 'http', 'i18n', 'route'],

    props: {
        id: {
            type: [String, Number],
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        query: {
            type: String,
            default: null,
        },
        compact: {
            type: Boolean,
            default: false,
        },
    },

    emits: ['update'],

    data: v => ({
        comments: [],
        comment: null,
        faPlus,
        faSearch,
        faArrowsRotate,
        loading: false,
        internalQuery: '',
        path: v.$route.path,
    }),

    computed: {
        filteredComments() {
            const query = this.internalQuery.toLowerCase();

            return query
                ? this.comments.filter(({ body, owner }) => body.toLowerCase().indexOf(query) > -1
                    || owner.person.name.toLowerCase().indexOf(query) > -1)
                : this.comments;
        },
        count() {
            return this.filteredComments.length;
        },
        params() {
            return {
                commentable_id: this.id,
                commentable_type: this.type,
            };
        },
    },

    watch: {
        query() {
            this.internalQuery = this.query;
        },
    },

    created() {
        this.fetch();
    },

    methods: {
        fetch() {
            this.loading = true;

            this.http.get(
                this.route('core.comments.index'),
                { params: this.params },
            ).then(({ data }) => {
                this.comments = data.data;
                this.humanReadableDates = data.humanReadableDates;
                this.loading = false;
                this.$emit('update');
            }).catch(this.errorHandler);
        },

        factory() {
            return {
                body: '',
                taggedUsers: [],
                owner: app().user,
            };
        },
        create() {
            if (this.comment) {
                return;
            }

            this.comment = this.factory();
        },
        add() {
            if (!this.comment.body.trim()) {
                return;
            }

            this.loading = true;

            this.http.post(
                this.route('core.comments.store'),
                this.postParams(),
            ).then(({ data }) => {
                this.comments.unshift(data);
                this.comment = null;
                this.$emit('update');
                this.loading = false;
            }).catch(this.errorHandler);
        },
        postParams() {
            return {
                body: this.comment.body,
                taggedUsers: this.comment.taggedUsers,
                path: this.path,
                ...this.params,
            };
        },
        update(comment) {
            this.syncTaggedUsers(comment);
            comment.path = this.path;
            this.loading = true;

            this.http.patch(
                this.route('core.comments.update', comment.id),
                comment,
            ).then(({ data }) => {
                Object.assign(comment, data);
                this.loading = false;
            }).catch(this.errorHandler);
        },
        syncTaggedUsers(comment) {
            comment.taggedUsers.forEach((user, index) => {
                if (!comment.body.includes(user.name)) {
                    comment.taggedUsers.splice(index, 1);
                }
            });
        },
        destroy(index) {
            this.loading = true;

            this.http.delete(this.route('core.comments.destroy', this.comments[index].id))
                .then(() => {
                    this.comments.splice(index, 1);
                    this.$emit('update');
                    this.loading = false;
                }).catch(this.errorHandler);
        },
    },
};
</script>

<style lang="scss">
.comments-wrapper {
    .comments {
        max-height: 500px;
        overflow-y: auto;
    
        .box:not(:last-child) {
            margin-bottom: 0.5rem;
        }
    }
}
</style>
