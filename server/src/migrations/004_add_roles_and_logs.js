exports.up = async function (knex) {
    // 1. Update roles enum
    await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await knex.raw("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'sales_rep', 'dispatch_partner', 'head_of_sales', 'inventory_manager'))");

    // 2. Add missing fields and new log fields to orders table
    await knex.schema.alterTable('orders', (table) => {
        table.timestamp('scheduled_at');
        table.text('reschedule_reason');
        table.uuid('rescheduled_by');

        table.timestamp('callback_at');
        table.text('callback_comment');
        table.uuid('callback_set_by');

        table.timestamp('switched_off_at');
        table.timestamp('not_answering_at');

        table.integer('switched_off_count').defaultTo(0);
        table.integer('not_answering_count').defaultTo(0);
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable('orders', (table) => {
        table.dropColumn('switched_off_count');
        table.dropColumn('not_answering_count');
        table.dropColumn('switched_off_at');
        table.dropColumn('not_answering_at');
        table.dropColumn('callback_set_by');
        table.dropColumn('callback_comment');
        table.dropColumn('callback_at');
        table.dropColumn('rescheduled_by');
        table.dropColumn('reschedule_reason');
        table.dropColumn('scheduled_at');
    });

    await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await knex.raw("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'sales_rep', 'dispatch_partner'))");
};
