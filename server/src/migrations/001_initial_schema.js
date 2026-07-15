exports.up = async function (knex) {
    // Create tables in correct order (no foreign key dependencies first)

    // 1. Users table (no dependencies)
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('email', 255).unique().notNullable();
        table.string('password_hash', 255).notNullable();
        table.string('first_name', 100).notNullable();
        table.string('last_name', 100).notNullable();
        table.string('phone', 20);
        table.enum('role', ['admin', 'sales_rep', 'dispatch_partner']).notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
    });

    // 2. Products table (no dependencies)
    await knex.schema.createTable('products', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('name', 255).notNullable();
        table.text('description');
        table.decimal('price', 10, 2).notNullable();
        table.integer('quantity').notNullable().defaultTo(0);
        table.string('sku', 100).unique();
        table.string('image_url');
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
    });

    // 3. Customers table (no dependencies)
    await knex.schema.createTable('customers', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('first_name', 100).notNullable();
        table.string('last_name', 100).notNullable();
        table.string('email', 255).notNullable();
        table.string('phone', 20).notNullable();
        table.text('address');
        table.string('city', 100);
        table.string('state', 100);
        table.string('utm_source');
        table.string('utm_medium');
        table.string('utm_campaign');
        table.timestamps(true, true);
    });

    // 4. Orders table (depends on products, customers, users)
    await knex.schema.createTable('orders', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('product_id').references('id').inTable('products').onDelete('SET NULL');
        table.uuid('customer_id').references('id').inTable('customers').onDelete('SET NULL');
        table.uuid('sales_rep_id').references('id').inTable('users').onDelete('SET NULL');
        table.integer('quantity').notNullable().defaultTo(1);
        table.decimal('total_amount', 10, 2).notNullable();
        table.enum('status', [
            'pending', 'assigned', 'confirmed', 'processing',
            'dispatched', 'delivered', 'completed', 'cancelled'
        ]).defaultTo('pending');
        table.enum('payment_method', ['online', 'delivery']).notNullable();
        table.boolean('is_paid').defaultTo(false);
        table.text('notes');
        table.timestamp('delivered_at');
        table.timestamps(true, true);
    });

    // 5. Audit logs table (no dependencies)
    await knex.schema.createTable('audit_logs', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id');
        table.string('user_role', 50);
        table.string('action', 50).notNullable();
        table.string('entity', 100).notNullable();
        table.uuid('entity_id');
        table.jsonb('old_values');
        table.jsonb('new_values');
        table.string('ip_address', 45);
        table.text('user_agent');
        table.string('endpoint', 255);
        table.string('method', 10);
        table.timestamp('timestamp').defaultTo(knex.fn.now());
    });

    console.log('✅ Initial schema created successfully');
};

exports.down = async function (knex) {
    // Drop in reverse order
    await knex.schema.dropTableIfExists('audit_logs');
    await knex.schema.dropTableIfExists('orders');
    await knex.schema.dropTableIfExists('customers');
    await knex.schema.dropTableIfExists('products');
    await knex.schema.dropTableIfExists('users');

    console.log('✅ Initial schema dropped');
};