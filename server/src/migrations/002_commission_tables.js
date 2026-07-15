exports.up = async function (knex) {
    await knex.schema.createTable('user_commissions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').notNullable().unique().onDelete('CASCADE');
        table.enum('structure', ['commission_only', 'salary_only', 'salary_plus_commission']).notNullable();
        table.decimal('base_salary', 10, 2).defaultTo(0);
        table.decimal('commission_percentage', 5, 2).defaultTo(0);
        table.boolean('is_active').defaultTo(true);
        table.timestamp('effective_from').defaultTo(knex.fn.now());
        table.timestamps(true, true);
    });

    await knex.schema.createTable('earnings', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
        table.uuid('order_id').references('id').inTable('orders').onDelete('SET NULL');
        table.enum('type', ['commission', 'salary', 'bonus']).notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.enum('status', ['pending', 'paid', 'cancelled']).defaultTo('pending');
        table.text('description');
        table.timestamp('earned_at').defaultTo(knex.fn.now());
        table.timestamps(true, true);
    });

    await knex.schema.createTable('payment_transactions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('order_id').references('id').inTable('orders').notNullable().onDelete('CASCADE');
        table.string('reference', 255).unique().notNullable();
        table.enum('provider', ['paystack', 'flutterwave', 'cash']).notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.enum('status', ['pending', 'successful', 'failed']).defaultTo('pending');
        table.jsonb('metadata');
        table.timestamps(true, true);
    });

    console.log('✅ Commission tables created');
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('payment_transactions');
    await knex.schema.dropTableIfExists('earnings');
    await knex.schema.dropTableIfExists('user_commissions');

    console.log('✅ Commission tables dropped');
};