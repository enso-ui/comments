<template>
    <div class="box comment-card p-3">
        <article class="media"
            @mouseover="controls = true"
            @mouseleave="controls = !confirmation ? false : controls">
            <figure class="media-left">
                <p class="image is-32x32">
                    <img class="is-rounded"
                        alt="avatar"
                        :src="route('core.avatars.show', comment.owner.avatar.id)">
                </p>
            </figure>
            <div class="media-content">
                <div class="mb-2"
                    v-if="!isNew">
                    <a class="has-text-dark">
                        <strong>{{ comment.owner.person.name }}</strong>
                    </a>
                    <span class="has-text-light ml-1"
                        v-tooltip="dateFormat(commentedAt)"
                        v-if="humanReadableDates">
                        {{ timeFromNow(commentedAt) }} {{ i18n('ago') }}
                    </span>
                    <span class="has-text-light ml-1"
                        v-tooltip="`${timeFromNow(commentedAt)} ${i18n('ago')}`"
                        v-else>
                        {{ dateFormat(commentedAt) }}
                    </span>
                    <span v-if="comment.createdAt !== comment.updatedAt">
                        &bull; {{ i18n('edited') }}
                    </span>
                    <div class="is-pulled-right is-flex"
                        v-if="!isNew && !isEditing && controls">
                        <a class="button is-naked is-small mr-1"
                            @click="originalBody = comment.body;"
                            v-if="comment.isEditable">
                            <span class="icon is-small">
                                <fa :icon="faPen"/>
                            </span>
                        </a>
                        <confirmation placement="bottom-end"
                            @confirm="$emit('delete')"
                            @show="confirmation = true"
                            @hide="confirmation = controls = false"
                            v-if="comment.isDeletable">
                            <a class="button is-naked is-small"
                                @click="confirmation = true">
                                <span class="icon is-small">
                                    <fa :icon="faTrashCan"/>
                                </span>
                            </a>
                        </confirmation>
                    </div>
                </div>
                <div class="comment-body"
                    v-html="highlightTaggedUsers"
                    v-if="!isEditing && !isNew"/>
                <div v-else>
                    <inputor v-bind="$attrs"
                         :comment="comment"/>
                    <div class="mt-2 has-text-right">
                        <a class="button mr-1 is-small"
                            @click="isNew ? $emit('cancel-add') : cancelAdd()">
                            <span>
                                {{ i18n('Cancel') }}
                            </span>
                            <span class="icon is-small">
                                <fa :icon="faBan"/>
                            </span>
                        </a>
                        <a class="button is-small is-dark"
                            @click="isNew ? $emit('save') : update()">
                            <span v-if="isNew">
                                {{ i18n('Post') }}
                            </span>
                            <span v-else>
                                {{ i18n('Update') }}
                            </span>
                            <span class="icon is-small">
                                <fa :icon="faCheck"/>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </article>
    </div>
</template>

<script>
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
import {
    faPen, faTrashCan, faCheck, faBan,
} from '@fortawesome/free-solid-svg-icons';
import Confirmation from '@enso-ui/confirmation/bulma';
import { app } from '@enso-ui/ui/src/pinia/app';
import format from '@enso-ui/ui/src/modules/plugins/date-fns/format';
import formatDistance from '@enso-ui/ui/src/modules/plugins/date-fns/formatDistance';
import Inputor from './Inputor.vue';

export default {
    name: 'Comment',

    components: { Fa, Inputor, Confirmation },

    inject: ['i18n', 'route'],

    props: {
        comment: {
            type: Object,
            required: true,
        },
        humanReadableDates: {
            type: Boolean,
            default: true,
        },
        index: {
            type: Number,
            default: null,
        },
        isNew: {
            type: Boolean,
            default: false,
        },
    },

    emits: ['cancel-add', 'cancel-edit', 'delete', 'save'],

    data: () => ({
        controls: false,
        confirmation: false,
        originalBody: null,
        faPen,
        faTrashCan,
        faCheck,
        faBan,
    }),

    computed: {
        highlightTaggedUsers() {
            let { body } = this.comment;

            this.comment.taggedUsers
                .forEach(({ name }) => {
                    const highlighted = `${'<span class="has-text-info">@'}${name}</span>`;
                    body = body.replace(`@${name}`, highlighted);
                });

            return body;
        },
        isEditing() {
            return this.originalBody !== null;
        },
        commentedAt() {
            return this.comment.updatedAt || this.comment.createdAt;
        },
    },

    methods: {
        cancelAdd() {
            this.comment.body = this.originalBody;
            this.controls = false;
            this.originalBody = null;
            this.$emit('cancel-edit');
        },
        update() {
            if (!this.comment.body.trim()) {
                return;
            }

            this.controls = false;

            if (this.comment.body === this.originalBody) {
                this.originalBody = null;
                return;
            }

            this.$emit('save');

            this.originalBody = null;
        },
        timeFromNow(date) {
            return formatDistance(date);
        },
        dateFormat(date) {
            return format(date, `${app().meta.dateFormat} H:i`);
        },
    },
};
</script>

<style lang="scss">
.comment-card {
    .media {
        border-radius: inherit;

        .comment-body {
            word-break: break-word;
        }

        .media-content {
            overflow: unset;
        }
    }
}
</style>
