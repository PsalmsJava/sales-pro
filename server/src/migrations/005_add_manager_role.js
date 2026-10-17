exports.up = async function (knex) {
    // Add 'manager' to the allowed roles (General Manager - second only to admin)
    await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await knex.raw("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'head_of_sales', 'inventory_manager', 'sales_rep', 'dispatch_partner'))");
};

exports.down = async function (knex) {
    await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await knex.raw("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'head_of_sales', 'inventory_manager', 'sales_rep', 'dispatch_partner'))");
};
