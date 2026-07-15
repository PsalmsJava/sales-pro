const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
    // Clean all tables in correct order (children first, then parents)
    console.log('🧹 Cleaning existing data...');

    try { await knex('dispatch_earnings').del(); } catch (e) { }
    try { await knex('dispatch_assignments').del(); } catch (e) { }
    try { await knex('dispatch_partners').del(); } catch (e) { }
    try { await knex('earnings').del(); } catch (e) { }
    try { await knex('payment_transactions').del(); } catch (e) { }
    try { await knex('user_commissions').del(); } catch (e) { }
    try { await knex('audit_logs').del(); } catch (e) { }
    try { await knex('orders').del(); } catch (e) { }
    try { await knex('customers').del(); } catch (e) { }
    try { await knex('products').del(); } catch (e) { }
    try { await knex('users').del(); } catch (e) { }

    console.log('✅ All tables cleaned');

    // ... rest of the seed file remains the same ...

    // ==========================================
    // 1. USERS - Create all users
    // ==========================================

    const passwordHash = await bcrypt.hash('Password@123', 12);

    // Admin users (3)
    const admins = [
        { id: uuidv4(), email: 'admin@salespro.com', password_hash: passwordHash, first_name: 'James', last_name: 'Anderson', phone: '+2348012345678', role: 'admin', is_active: true },
        { id: uuidv4(), email: 'superadmin@salespro.com', password_hash: passwordHash, first_name: 'Sarah', last_name: 'Williams', phone: '+2348023456789', role: 'admin', is_active: true },
        { id: uuidv4(), email: 'manager@salespro.com', password_hash: passwordHash, first_name: 'Michael', last_name: 'Brown', phone: '+2348034567890', role: 'admin', is_active: true }
    ];

    // Sales Representatives (35)
    const salesRepsData = [
        { first_name: 'John', last_name: 'Smith', phone: '+2348045678901' },
        { first_name: 'Emma', last_name: 'Johnson', phone: '+2348056789012' },
        { first_name: 'David', last_name: 'Martinez', phone: '+2348067890123' },
        { first_name: 'Lisa', last_name: 'Garcia', phone: '+2348078901234' },
        { first_name: 'Robert', last_name: 'Wilson', phone: '+2348089012345' },
        { first_name: 'Jennifer', last_name: 'Taylor', phone: '+2348090123456' },
        { first_name: 'Daniel', last_name: 'Thomas', phone: '+2348101234567' },
        { first_name: 'Patricia', last_name: 'Jackson', phone: '+2348112345678' },
        { first_name: 'Christopher', last_name: 'White', phone: '+2348123456789' },
        { first_name: 'Michelle', last_name: 'Harris', phone: '+2348134567890' },
        { first_name: 'Andrew', last_name: 'Clark', phone: '+2348145678901' },
        { first_name: 'Amanda', last_name: 'Lewis', phone: '+2348156789012' },
        { first_name: 'Joshua', last_name: 'Robinson', phone: '+2348167890123' },
        { first_name: 'Stephanie', last_name: 'Walker', phone: '+2348178901234' },
        { first_name: 'Ryan', last_name: 'Hall', phone: '+2348189012345' },
        { first_name: 'Nicole', last_name: 'Allen', phone: '+2348190123456' },
        { first_name: 'Kevin', last_name: 'Young', phone: '+2348201234567' },
        { first_name: 'Ashley', last_name: 'King', phone: '+2348212345678' },
        { first_name: 'Brandon', last_name: 'Wright', phone: '+2348223456789' },
        { first_name: 'Samantha', last_name: 'Scott', phone: '+2348234567890' },
        { first_name: 'Justin', last_name: 'Green', phone: '+2348245678901' },
        { first_name: 'Rachel', last_name: 'Adams', phone: '+2348256789012' },
        { first_name: 'Tyler', last_name: 'Baker', phone: '+2348267890123' },
        { first_name: 'Megan', last_name: 'Nelson', phone: '+2348278901234' },
        { first_name: 'Austin', last_name: 'Carter', phone: '+2348289012345' },
        { first_name: 'Lauren', last_name: 'Mitchell', phone: '+2348290123456' },
        { first_name: 'Jacob', last_name: 'Perez', phone: '+2348301234567' },
        { first_name: 'Brittany', last_name: 'Roberts', phone: '+2348312345678' },
        { first_name: 'Matthew', last_name: 'Turner', phone: '+2348323456789' },
        { first_name: 'Jessica', last_name: 'Phillips', phone: '+2348334567890' },
        { first_name: 'Nicholas', last_name: 'Campbell', phone: '+2348345678901' },
        { first_name: 'Heather', last_name: 'Parker', phone: '+2348356789012' },
        { first_name: 'Zachary', last_name: 'Evans', phone: '+2348367890123' },
        { first_name: 'Victoria', last_name: 'Edwards', phone: '+2348378901234' },
        { first_name: 'Alexander', last_name: 'Collins', phone: '+2348389012345' }
    ];

    const salesReps = salesRepsData.map(rep => ({
        id: uuidv4(),
        email: `${rep.first_name.toLowerCase()}.${rep.last_name.toLowerCase()}@salespro.com`,
        password_hash: passwordHash,
        first_name: rep.first_name,
        last_name: rep.last_name,
        phone: rep.phone,
        role: 'sales_rep',
        is_active: Math.random() > 0.1 // 90% active
    }));

    // Dispatch partners (30)
    const dispatchCompanies = [
        { company_name: 'SpeedEx Logistics', contact_person: 'Henry Okafor', city: 'Lagos', state: 'Lagos' },
        { company_name: 'QuickShip Delivery', contact_person: 'Grace Emmanuel', city: 'Abuja', state: 'FCT' },
        { company_name: 'Metro Movers', contact_person: 'Victor Adebayo', city: 'Port Harcourt', state: 'Rivers' },
        { company_name: 'CityLink Couriers', contact_person: 'Blessing Okonkwo', city: 'Kano', state: 'Kano' },
        { company_name: 'Swift Delivery Pro', contact_person: 'Emmanuel John', city: 'Ibadan', state: 'Oyo' },
        { company_name: 'ExpressPack Logistics', contact_person: 'Folasade Adekunle', city: 'Enugu', state: 'Enugu' },
        { company_name: 'DirectRoute Delivery', contact_person: 'Chidi Eze', city: 'Benin City', state: 'Edo' },
        { company_name: 'SameDay Express', contact_person: 'Aisha Mohammed', city: 'Kaduna', state: 'Kaduna' },
        { company_name: 'BlueSky Logistics', contact_person: 'Oluwaseun Ogunleye', city: 'Lagos', state: 'Lagos' },
        { company_name: 'Urban Sprint Couriers', contact_person: 'Ngozi Nwosu', city: 'Aba', state: 'Abia' },
        { company_name: 'FlashMove Delivery', contact_person: 'Yusuf Ibrahim', city: 'Jos', state: 'Plateau' },
        { company_name: 'ProShip Nigeria', contact_person: 'Amara Chukwu', city: 'Owerri', state: 'Imo' },
        { company_name: 'Turbo Logistics', contact_person: 'Kingsley Bassey', city: 'Calabar', state: 'Cross River' },
        { company_name: 'Prime Delivery Service', contact_person: 'Zainab Bello', city: 'Abuja', state: 'FCT' },
        { company_name: 'Rocket Express', contact_person: 'Dayo Olaniyan', city: 'Lagos', state: 'Lagos' },
        { company_name: 'PakTrack Delivery', contact_person: 'Chinonso Obi', city: 'Onitsha', state: 'Anambra' },
        { company_name: 'Nova Logistics', contact_person: 'Fatima Suleiman', city: 'Maiduguri', state: 'Borno' },
        { company_name: 'SwiftHand Couriers', contact_person: 'Tunde Alabi', city: 'Ilorin', state: 'Kwara' },
        { company_name: 'Edge Delivery Co', contact_person: 'Ebere Okeke', city: 'Awka', state: 'Anambra' },
        { company_name: 'Dash Express', contact_person: 'Musa Abdullahi', city: 'Sokoto', state: 'Sokoto' },
        { company_name: 'Prestige Logistics', contact_person: 'Adaeze Uche', city: 'Uyo', state: 'Akwa Ibom' },
        { company_name: 'ZoomShip Nigeria', contact_person: 'Obinna Okafor', city: 'Lagos', state: 'Lagos' },
        { company_name: 'GoDeliver Pro', contact_person: 'Hauwa Adamu', city: 'Zaria', state: 'Kaduna' },
        { company_name: 'Alpha Courier Express', contact_person: 'Dele Fashola', city: 'Abeokuta', state: 'Ogun' },
        { company_name: 'MegaMove Logistics', contact_person: 'Ijeoma Eze', city: 'Enugu', state: 'Enugu' },
        { company_name: 'Lightning Delivery', contact_person: 'Solomon Osei', city: 'Accra', state: 'Greater Accra' },
        { company_name: 'ConnectShip', contact_person: 'Rukayya Yusuf', city: 'Minna', state: 'Niger' },
        { company_name: 'SureWay Delivery', contact_person: 'Ebuka Nnamdi', city: 'Asaba', state: 'Delta' },
        { company_name: 'QuickRun Logistics', contact_person: 'Thelma John', city: 'Port Harcourt', state: 'Rivers' },
        { company_name: 'Eagle Express Nigeria', contact_person: 'Ibrahim Danladi', city: 'Gombe', state: 'Gombe' }
    ];

    const dispatchUsers = dispatchCompanies.map((company, index) => ({
        id: uuidv4(),
        email: `dispatch${index + 1}@${company.company_name.toLowerCase().replace(/\s+/g, '')}.com`,
        password_hash: passwordHash,
        first_name: company.contact_person.split(' ')[0],
        last_name: company.contact_person.split(' ').slice(1).join(' ') || '',
        phone: `+234${8000000000 + index}`,
        role: 'dispatch_partner',
        is_active: Math.random() > 0.15
    }));

    // Insert all users
    const allUsers = [...admins, ...salesReps, ...dispatchUsers];
    await knex('users').insert(allUsers);

    console.log(`✅ Created ${allUsers.length} users (${admins.length} admins, ${salesReps.length} sales reps, ${dispatchUsers.length} dispatch partners)`);

    // ==========================================
    // 2. DISPATCH PARTNERS PROFILES
    // ==========================================

    const dispatchProfiles = dispatchUsers.map((user, index) => ({
        id: uuidv4(),
        user_id: user.id,
        company_name: dispatchCompanies[index].company_name,
        contact_person: dispatchCompanies[index].contact_person,
        contact_phone: user.phone,
        contact_email: user.email,
        address: `${Math.floor(Math.random() * 200) + 1} ${['Main Street', 'Broadway', 'Victoria Road', 'Independence Avenue', 'Marina Road'][index % 5]}`,
        city: dispatchCompanies[index].city,
        state: dispatchCompanies[index].state,
        vehicle_type: ['Motorcycle', 'Van', 'Truck', 'Bicycle', 'Car'][index % 5],
        license_number: `DL-${String(index + 1).padStart(6, '0')}-NG`,
        is_verified: Math.random() > 0.3,
        is_active: user.is_active
    }));

    await knex('dispatch_partners').insert(dispatchProfiles);
    console.log(`✅ Created ${dispatchProfiles.length} dispatch partner profiles`);

    // ==========================================
    // 3. COMMISSION CONFIGURATIONS
    // ==========================================

    const commissionStructures = ['commission_only', 'salary_only', 'salary_plus_commission'];
    const commissionConfigs = salesReps.map(rep => {
        const structure = commissionStructures[Math.floor(Math.random() * commissionStructures.length)];
        return {
            id: uuidv4(),
            user_id: rep.id,
            structure: structure,
            base_salary: ['salary_only', 'salary_plus_commission'].includes(structure) ?
                (50000 + Math.floor(Math.random() * 150000)) : 0,
            commission_percentage: ['commission_only', 'salary_plus_commission'].includes(structure) ?
                (5 + Math.floor(Math.random() * 20)) : 0,
            is_active: true,
            effective_from: new Date('2024-01-01')
        };
    });

    await knex('user_commissions').insert(commissionConfigs);
    console.log(`✅ Created ${commissionConfigs.length} commission configurations`);

    // ==========================================
    // 4. PRODUCTS (30 products)
    // ==========================================

    const products = [
        { name: 'Premium Wireless Headphones', price: 45000, quantity: 150, sku: 'SKU-PWH-001', description: 'High-quality wireless headphones with noise cancellation' },
        { name: 'Smart Watch Pro', price: 85000, quantity: 80, sku: 'SKU-SWP-002', description: 'Advanced smartwatch with health monitoring features' },
        { name: 'Leather Laptop Bag', price: 25000, quantity: 200, sku: 'SKU-LLB-003', description: 'Premium leather laptop bag, fits 15.6" laptops' },
        { name: 'Bluetooth Speaker Mini', price: 15000, quantity: 300, sku: 'SKU-BSM-004', description: 'Portable bluetooth speaker with rich bass' },
        { name: 'Organic Face Cream', price: 12000, quantity: 500, sku: 'SKU-OFC-005', description: 'Natural organic face cream for all skin types' },
        { name: 'Fitness Resistance Bands', price: 8000, quantity: 400, sku: 'SKU-FRB-006', description: 'Set of 5 resistance bands for home workouts' },
        { name: 'Stainless Steel Water Bottle', price: 7000, quantity: 600, sku: 'SKU-SWB-007', description: 'Insulated water bottle, keeps drinks cold for 24hrs' },
        { name: 'Wireless Charging Pad', price: 10000, quantity: 250, sku: 'SKU-WCP-008', description: 'Fast wireless charger compatible with all Qi devices' },
        { name: 'Yoga Mat Premium', price: 18000, quantity: 150, sku: 'SKU-YMP-009', description: 'Extra thick eco-friendly yoga mat with carrying strap' },
        { name: 'Portable Power Bank 20000mAh', price: 22000, quantity: 180, sku: 'SKU-PPB-010', description: 'High capacity power bank with fast charging' },
        { name: 'Running Shoes Ultra', price: 55000, quantity: 120, sku: 'SKU-RSU-011', description: 'Lightweight running shoes with cushioning technology' },
        { name: 'Digital Kitchen Scale', price: 9500, quantity: 350, sku: 'SKU-DKS-012', description: 'Precision digital scale with tare function' },
        { name: 'LED Desk Lamp', price: 16000, quantity: 200, sku: 'SKU-LDL-013', description: 'Adjustable LED desk lamp with multiple brightness levels' },
        { name: 'Men\'s Classic Watch', price: 35000, quantity: 90, sku: 'SKU-MCW-014', description: 'Elegant analog watch with leather strap' },
        { name: 'Protein Powder 1kg', price: 28000, quantity: 300, sku: 'SKU-PPP-015', description: 'Whey protein isolate, chocolate flavor' },
        { name: 'Phone Tripod Stand', price: 11000, quantity: 400, sku: 'SKU-PTS-016', description: 'Adjustable tripod stand for smartphones' },
        { name: 'Air Fryer 5.5L', price: 65000, quantity: 60, sku: 'SKU-AFR-017', description: 'Digital air fryer with multiple cooking presets' },
        { name: 'Backpack with USB Port', price: 20000, quantity: 250, sku: 'SKU-BUP-018', description: 'Anti-theft backpack with built-in USB charging port' },
        { name: 'Electric Toothbrush', price: 14000, quantity: 280, sku: 'SKU-ETB-019', description: 'Sonic electric toothbrush with 5 cleaning modes' },
        { name: 'Coffee Maker Machine', price: 42000, quantity: 70, sku: 'SKU-CMM-020', description: 'Programmable coffee maker with thermal carafe' },
        { name: 'Gaming Mouse RGB', price: 25000, quantity: 160, sku: 'SKU-GMR-021', description: 'High-precision gaming mouse with customizable RGB' },
        { name: 'Desk Organizer Set', price: 13000, quantity: 450, sku: 'SKU-DOS-022', description: 'Complete desk organization set with 7 pieces' },
        { name: 'Sunglasses Polarized', price: 19000, quantity: 200, sku: 'SKU-SPG-023', description: 'UV400 polarized sunglasses for men and women' },
        { name: 'Humidifier Ultrasonic', price: 21000, quantity: 130, sku: 'SKU-HUM-024', description: 'Quiet ultrasonic humidifier with essential oil diffuser' },
        { name: 'Wireless Earbuds TWS', price: 32000, quantity: 140, sku: 'SKU-WET-025', description: 'True wireless earbuds with active noise cancellation' },
        { name: 'Resistance Loop Bands', price: 6000, quantity: 550, sku: 'SKU-RLB-026', description: 'Set of 4 resistance loop bands for exercise' },
        { name: 'Travel Neck Pillow', price: 9000, quantity: 380, sku: 'SKU-TNP-027', description: 'Memory foam neck pillow for travel comfort' },
        { name: 'Smart LED Bulb', price: 11000, quantity: 420, sku: 'SKU-SLB-028', description: 'WiFi-enabled smart LED bulb with app control' },
        { name: 'Car Phone Holder', price: 7500, quantity: 500, sku: 'SKU-CPH-029', description: 'Universal car dashboard phone mount' },
        { name: 'Insulated Lunch Box', price: 8500, quantity: 320, sku: 'SKU-ILB-030', description: 'Leak-proof insulated lunch container bag' }
    ];

    const productsWithIds = products.map(product => ({
        id: uuidv4(),
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        sku: product.sku,
        is_active: true
    }));

    await knex('products').insert(productsWithIds);
    console.log(`✅ Created ${productsWithIds.length} products`);

    // ==========================================
    // 5. CUSTOMERS (100 customers)
    // ==========================================

    const nigerianCities = [
        { city: 'Lagos', state: 'Lagos' },
        { city: 'Abuja', state: 'FCT' },
        { city: 'Port Harcourt', state: 'Rivers' },
        { city: 'Kano', state: 'Kano' },
        { city: 'Ibadan', state: 'Oyo' },
        { city: 'Enugu', state: 'Enugu' },
        { city: 'Benin City', state: 'Edo' },
        { city: 'Kaduna', state: 'Kaduna' },
        { city: 'Aba', state: 'Abia' },
        { city: 'Owerri', state: 'Imo' },
        { city: 'Jos', state: 'Plateau' },
        { city: 'Calabar', state: 'Cross River' },
        { city: 'Onitsha', state: 'Anambra' },
        { city: 'Ilorin', state: 'Kwara' },
        { city: 'Abeokuta', state: 'Ogun' }
    ];

    const customerFirstNames = ['Adebayo', 'Chinelo', 'Emeka', 'Folake', 'Gbenga', 'Ifeoma', 'Jide', 'Kemi', 'Lekan', 'Mojisola', 'Nnamdi', 'Oluwaseun', 'Patience', 'Quadri', 'Rashidat', 'Sunday', 'Temitope', 'Uche', 'Victoria', 'Wale', 'Yemi', 'Zainab', 'Amarachi', 'Babatunde', 'Chisom', 'Damilola', 'Efe', 'Funke', 'Godwin', 'Hauwa'];
    const customerLastNames = ['Okonkwo', 'Adebayo', 'Okafor', 'Mohammed', 'Abubakar', 'Nwachukwu', 'Olaniyan', 'Balogun', 'Eze', 'Ahmed', 'Ogunleye', 'Yusuf', 'Chukwu', 'Adamu', 'Obi', 'Bello', 'Suleiman', 'Nwosu', 'Danladi', 'Ibrahim', 'Afolabi', 'Osei', 'Mensah', 'Sani', 'Uche', 'Aliyu', 'Ogunsanya', 'Oladipo', 'Ekong', 'Nkoli'];

    const customers = [];
    for (let i = 0; i < 100; i++) {
        const cityData = nigerianCities[Math.floor(Math.random() * nigerianCities.length)];
        customers.push({
            id: uuidv4(),
            first_name: customerFirstNames[i % customerFirstNames.length],
            last_name: customerLastNames[i % customerLastNames.length],
            email: `customer${i + 1}@email.com`,
            phone: `+234${7000000000 + Math.floor(Math.random() * 999999999)}`,
            address: `${Math.floor(Math.random() * 200) + 1} ${['Main Street', 'Broadway', 'Church Road', 'Market Road', 'Airport Road'][i % 5]}`,
            city: cityData.city,
            state: cityData.state,
            utm_source: ['facebook', 'instagram', 'twitter', 'google', null][Math.floor(Math.random() * 5)],
            utm_medium: ['cpc', 'organic', 'social', null][Math.floor(Math.random() * 4)],
            utm_campaign: ['summer_sale', 'new_launch', 'clearance', 'holiday_special', null][Math.floor(Math.random() * 5)]
        });
    }

    await knex('customers').insert(customers);
    console.log(`✅ Created ${customers.length} customers`);

    // ==========================================
    // 6. ORDERS (150 orders with various statuses)
    // ==========================================

    const orderStatuses = ['pending', 'assigned', 'confirmed', 'processing', 'dispatched', 'delivered', 'completed', 'cancelled'];
    const paymentMethods = ['online', 'delivery'];
    const activeSalesReps = salesReps.filter(rep => rep.is_active);

    const orders = [];
    for (let i = 0; i < 150; i++) {
        const product = productsWithIds[Math.floor(Math.random() * productsWithIds.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // Assign sales rep for orders that aren't pending
        const salesRepId = status !== 'pending' && Math.random() > 0.2 ?
            activeSalesReps[Math.floor(Math.random() * activeSalesReps.length)].id : null;

        // Create dates spread across the last 6 months
        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 180));

        const deliveredDate = ['delivered', 'completed'].includes(status) ?
            new Date(createdDate.getTime() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) : null;

        orders.push({
            id: uuidv4(),
            product_id: product.id,
            customer_id: customer.id,
            sales_rep_id: salesRepId,
            quantity: quantity,
            total_amount: product.price * quantity,
            status: status,
            payment_method: paymentMethod,
            is_paid: paymentMethod === 'online' || ['delivered', 'completed'].includes(status),
            delivered_at: deliveredDate,
            notes: Math.random() > 0.7 ? 'Please deliver before 5pm' : null,
            created_at: createdDate,
            updated_at: new Date()
        });
    }

    // Sort by creation date
    orders.sort((a, b) => a.created_at - b.created_at);
    await knex('orders').insert(orders);
    console.log(`✅ Created ${orders.length} orders`);

    // ==========================================
    // 7. DISPATCH ASSIGNMENTS (60 assignments)
    // ==========================================

    const dispatchedOrders = orders.filter(o =>
        ['dispatched', 'delivered', 'completed'].includes(o.status) &&
        Math.random() > 0.3
    );

    const verifiedPartners = dispatchProfiles.filter(p => p.is_verified && p.is_active);
    const dispatchAssignments = [];

    for (const order of dispatchedOrders.slice(0, 60)) {
        const partner = verifiedPartners[Math.floor(Math.random() * verifiedPartners.length)];
        const deliveryFee = Math.floor(order.total_amount * (0.05 + Math.random() * 0.1));

        let assignmentStatus = 'assigned';
        if (order.status === 'dispatched') assignmentStatus = ['assigned', 'picked_up', 'in_transit'][Math.floor(Math.random() * 3)];
        else if (order.status === 'delivered') assignmentStatus = 'delivered';
        else if (order.status === 'completed') assignmentStatus = 'delivered';

        dispatchAssignments.push({
            id: uuidv4(),
            order_id: order.id,
            dispatch_partner_id: partner.id,
            status: assignmentStatus,
            pickup_time: ['picked_up', 'in_transit', 'delivered'].includes(assignmentStatus) ? new Date(order.created_at.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
            delivery_time: assignmentStatus === 'delivered' ? new Date(order.created_at.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
            delivery_fee: deliveryFee,
            delivery_notes: assignmentStatus === 'delivered' ? 'Delivered successfully to recipient' : null,
            recipient_name: assignmentStatus === 'delivered' ? `${customerFirstNames[Math.floor(Math.random() * customerFirstNames.length)]} ${customerLastNames[Math.floor(Math.random() * customerLastNames.length)]}` : null,
            proof_of_delivery_url: assignmentStatus === 'delivered' ? 'https://example.com/proof/delivery-' + Math.random().toString(36).substring(7) + '.jpg' : null,
            created_at: order.created_at,
            updated_at: new Date()
        });
    }

    await knex('dispatch_assignments').insert(dispatchAssignments);
    console.log(`✅ Created ${dispatchAssignments.length} dispatch assignments`);

    // ==========================================
    // 8. EARNINGS (Sales Rep Commissions)
    // ==========================================

    const completedOrders = orders.filter(o =>
        ['delivered', 'completed'].includes(o.status) && o.sales_rep_id
    );

    const earnings = [];
    for (const order of completedOrders) {
        const repConfig = commissionConfigs.find(c => c.user_id === order.sales_rep_id);
        if (!repConfig) continue;

        if (['commission_only', 'salary_plus_commission'].includes(repConfig.structure)) {
            const commissionAmount = (order.total_amount * repConfig.commission_percentage) / 100;
            earnings.push({
                id: uuidv4(),
                user_id: order.sales_rep_id,
                order_id: order.id,
                type: 'commission',
                amount: commissionAmount,
                status: Math.random() > 0.3 ? 'paid' : 'pending',
                description: `Commission (${repConfig.commission_percentage}%) on order #${order.id.slice(0, 8)}`,
                earned_at: order.delivered_at || order.updated_at,
                created_at: order.delivered_at || order.updated_at
            });
        }
    }

    // Add some salary entries
    const salaryMonths = 6;
    for (let month = 0; month < salaryMonths; month++) {
        for (const rep of salesReps) {
            const config = commissionConfigs.find(c => c.user_id === rep.id);
            if (config && ['salary_only', 'salary_plus_commission'].includes(config.structure)) {
                const salaryDate = new Date();
                salaryDate.setMonth(salaryDate.getMonth() - month);
                salaryDate.setDate(1);

                earnings.push({
                    id: uuidv4(),
                    user_id: rep.id,
                    order_id: null,
                    type: 'salary',
                    amount: config.base_salary,
                    status: month === 0 ? 'pending' : 'paid',
                    description: `Monthly salary - ${salaryDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                    earned_at: salaryDate,
                    created_at: salaryDate
                });
            }
        }
    }

    await knex('earnings').insert(earnings);
    console.log(`✅ Created ${earnings.length} earnings records`);

    // ==========================================
    // 9. DISPATCH EARNINGS
    // ==========================================

    const deliveredAssignments = dispatchAssignments.filter(a => a.status === 'delivered');
    const dispatchEarnings = deliveredAssignments.map(assignment => {
        const commissionPercentage = 80;
        const earningsAmount = (assignment.delivery_fee * commissionPercentage) / 100;

        return {
            id: uuidv4(),
            dispatch_partner_id: assignment.dispatch_partner_id,
            assignment_id: assignment.id,
            amount: earningsAmount,
            commission_percentage: commissionPercentage,
            status: Math.random() > 0.4 ? 'paid' : 'pending',
            earned_at: assignment.delivery_time || assignment.updated_at,
            created_at: assignment.updated_at
        };
    });

    await knex('dispatch_earnings').insert(dispatchEarnings);
    console.log(`✅ Created ${dispatchEarnings.length} dispatch earnings records`);

    // ==========================================
    // 10. PAYMENT TRANSACTIONS
    // ==========================================

    const onlinePaidOrders = orders.filter(o => o.payment_method === 'online' && o.is_paid);
    const providers = ['paystack', 'flutterwave'];

    const paymentTransactions = onlinePaidOrders.map(order => ({
        id: uuidv4(),
        order_id: order.id,
        reference: `${['PS', 'FLW'][Math.floor(Math.random() * 2)]}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase(),
        provider: providers[Math.floor(Math.random() * providers.length)],
        amount: order.total_amount,
        status: 'successful',
        metadata: JSON.stringify({ payment_date: order.created_at }),
        created_at: order.created_at
    }));

    await knex('payment_transactions').insert(paymentTransactions);
    console.log(`✅ Created ${paymentTransactions.length} payment transactions`);

    // ==========================================
    // 11. AUDIT LOGS (sample)
    // ==========================================

    const auditLogs = [];
    const actions = ['CREATE', 'UPDATE', 'DELETE'];
    const entities = ['PRODUCT', 'ORDER', 'USER', 'COMMISSION_CONFIG', 'DISPATCH_PARTNER'];

    for (let i = 0; i < 200; i++) {
        const admin = admins[Math.floor(Math.random() * admins.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const entity = entities[Math.floor(Math.random() * entities.length)];
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - Math.floor(Math.random() * 30));

        auditLogs.push({
            id: uuidv4(),
            user_id: admin.id,
            user_role: 'admin',
            action: action,
            entity: entity,
            entity_id: uuidv4(),
            ip_address: '192.168.1.' + Math.floor(Math.random() * 255),
            user_agent: 'Mozilla/5.0 Admin Dashboard',
            endpoint: `/api/${entity.toLowerCase()}s`,
            method: action === 'CREATE' ? 'POST' : action === 'UPDATE' ? 'PUT' : 'DELETE',
            timestamp: logDate
        });
    }

    await knex('audit_logs').insert(auditLogs);
    console.log(`✅ Created ${auditLogs.length} audit logs`);

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('\n🎉 SEED COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DATA SUMMARY:');
    console.log(`   👤 Users: ${allUsers.length}`);
    console.log(`      - Admins: ${admins.length}`);
    console.log(`      - Sales Reps: ${salesReps.length}`);
    console.log(`      - Dispatch Partners: ${dispatchUsers.length}`);
    console.log(`   📦 Products: ${productsWithIds.length}`);
    console.log(`   👥 Customers: ${customers.length}`);
    console.log(`   🛒 Orders: ${orders.length}`);
    console.log(`   🚚 Dispatch Assignments: ${dispatchAssignments.length}`);
    console.log(`   💰 Sales Rep Earnings: ${earnings.length}`);
    console.log(`   💵 Dispatch Earnings: ${dispatchEarnings.length}`);
    console.log(`   💳 Payment Transactions: ${paymentTransactions.length}`);
    console.log(`   📝 Audit Logs: ${auditLogs.length}`);
    console.log('\n🔑 LOGIN CREDENTIALS (Password: Password@123):');
    console.log('   Admin: admin@salespro.com');
    console.log('   Sales Rep: john.smith@salespro.com');
    console.log('   Dispatch: dispatch1@speedexlogistics.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};