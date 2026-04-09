<template>
    <card collapsible
        :collapsed="collapsed">
        <card-header>
            <template #title>
                <span class="icon is-small mr-1">
                    <fa :icon="icon"/>
                </span>
                {{ displayTitle }}
            </template>
            <template #controls>
                <card-refresh @refresh="fetch"/>
                <card-badge :label="count"/>
                <card-collapse/>
            </template>
        </card-header>
        <card-content class="p-0">
            <comments :id="id"
                ref="comments"
                :type="type"
                :query="query"
                @update="count = $refs.comments.count; $refs.card.resize()"/>
        </card-content>
    </card>
</template>

<script>
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import {
    Card, CardHeader, CardRefresh, CardCollapse, CardBadge, CardContent,
} from '@enso-ui/card/bulma';
import Comments from './Comments.vue';
import { useStore } from '../utils/pinia';

export default {
    name: 'CommentsCard',

    components: {
        Fa, Card, CardHeader, CardRefresh, CardCollapse, CardBadge, CardContent, Comments,
    },

    inject: ['i18n'],

    props: {
        collapsed: {
            type: Boolean,
            default: false,
        },
        id: {
            type: [String, Number],
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            default: '',
        },
        icon: {
            type: [String, Array, Object],
            default: () => faComments,
        },
    },

    data: () => ({
        count: 0,
        query: null,
    }),

    computed: {
        isMobile() {
            return useStore('layout').isMobile;
        },
        displayTitle() {
            return !this.isMobile
                ? this.title || this.i18n('Comments')
                : null;
        },
        isEmpty() {
            return this.count === 0;
        },
    },

    watch: {
        count() {
            this.$refs.card.resize();
        },
    },

    methods: {
        addComment() {
            this.$refs.comments.create();
            this.$nextTick(() => this.$refs.card.expand());
        },
    },
};
</script>
