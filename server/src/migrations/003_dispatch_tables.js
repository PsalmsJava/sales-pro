exports.up = async function (knex) {
    await knex.schema.createTable('dispatch_partners', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').notNullable().unique().onDelete('CASCADE');
        table.string('company_name', 255).notNullable();
        table.string('contact_person', 255).notNullable();
        table.string('contact_phone', 20).notNullable();
        table.string('contact_email', 255).notNullable();
        table.text('address');
        table.string('city', 100);
        table.string('state', 100);
        table.string('vehicle_type', 100);
        table.string('license_number', 100);
        table.boolean('is_verified').defaultTo(false);
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
    });

    await knex.schema.createTable('dispatch_assignments', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('order_id').references('id').inTable('orders').notNullable().unique().onDelete('CASCADE');
        table.uuid('dispatch_partner_id').references('id').inTable('dispatch_partners').notNullable().onDelete('CASCADE');
        table.enum('status', ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled']).defaultTo('assigned');
        table.timestamp('pickup_time');
        table.timestamp('delivery_time');
        table.text('delivery_notes');
        table.string('recipient_name');
        table.string('recipient_signature');
        table.string('proof_of_delivery_url');
        table.decimal('delivery_fee', 10, 2);
        table.timestamps(true, true);
    });

    await knex.schema.createTable('dispatch_earnings', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('dispatch_partner_id').references('id').inTable('dispatch_partners').notNullable().onDelete('CASCADE');
        table.uuid('assignment_id').references('id').inTable('dispatch_assignments').notNullable().onDelete('CASCADE');
        table.decimal('amount', 10, 2).notNullable();
        table.decimal('commission_percentage', 5, 2).notNullable();
        table.enum('status', ['pending', 'paid']).defaultTo('pending');
        table.timestamp('earned_at').defaultTo(knex.fn.now());
        table.timestamps(true, true);
    });

    console.log('✅ Dispatch tables created');
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('dispatch_earnings');
    await knex.schema.dropTableIfExists('dispatch_assignments');
    await knex.schema.dropTableIfExists('dispatch_partners');

    console.log('✅ Dispatch tables dropped');
};