const dispatchPartnerRepository = require('../repositories/dispatchPartner.repository');
const dispatchAssignmentRepository = require('../repositories/dispatchAssignment.repository');
const dispatchEarningRepository = require('../repositories/dispatchEarning.repository');
const orderRepository = require('../repositories/order.repository');
const userRepository = require('../repositories/user.repository');
const authService = require('./auth.service');
const logger = require('../utils/logger');

class DispatchService {
    async registerPartner(partnerData) {
        try {
            // Check if email already exists
            const existingUser = await userRepository.findByEmail(partnerData.email);
            if (existingUser) {
                throw new Error('A user with this email already exists');
            }

            // Create user account for dispatch partner
            const user = await authService.createUser({
                email: partnerData.email,
                password: partnerData.password,
                firstName: partnerData.contactPerson.split(' ')[0],
                lastName: partnerData.contactPerson.split(' ').slice(1).join(' ') || '',
                phone: partnerData.contactPhone,
                role: 'dispatch_partner'
            }, 'system');

            // Create dispatch partner profile
            const partner = await dispatchPartnerRepository.create({
                user_id: user.id,
                company_name: partnerData.companyName,
                contact_person: partnerData.contactPerson,
                contact_phone: partnerData.contactPhone,
                contact_email: partnerData.email,
                address: partnerData.address,
                city: partnerData.city,
                state: partnerData.state,
                vehicle_type: partnerData.vehicleType,
                license_number: partnerData.licenseNumber,
                is_verified: false
            });

            logger.info('Dispatch partner registered', {
                partnerId: partner.id,
                company: partnerData.companyName
            });

            return {
                partner: this.formatPartner(partner),
                message: 'Registration successful. Your account is pending verification.'
            };
        } catch (error) {
            logger.error('Register dispatch partner error', { error: error.message });
            throw error;
        }
    }

    async verifyPartner(partnerId, adminId) {
        try {
            const partner = await dispatchPartnerRepository.verify(partnerId);

            logger.info('Dispatch partner verified', {
                partnerId,
                verifiedBy: adminId
            });

            return this.formatPartner(partner);
        } catch (error) {
            logger.error('Verify partner error', { error: error.message, partnerId });
            throw error;
        }
    }

    async assignDelivery(orderId, dispatchPartnerId, deliveryFee, adminId) {
        try {
            // Check order exists and is in processing status
            const order = await orderRepository.findById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            if (order.status !== 'processing') {
                throw new Error('Order must be in processing status for dispatch');
            }

            // Check if order already has dispatch assignment
            const existingAssignment = await dispatchAssignmentRepository.findByOrderId(orderId);
            if (existingAssignment) {
                throw new Error('This order already has a dispatch assignment');
            }

            // Check dispatch partner is verified and active
            const partner = await dispatchPartnerRepository.findById(dispatchPartnerId);
            if (!partner || !partner.is_verified || !partner.is_active) {
                throw new Error('Dispatch partner not available');
            }

            // Create dispatch assignment
            const assignment = await dispatchAssignmentRepository.create({
                order_id: orderId,
                dispatch_partner_id: dispatchPartnerId,
                delivery_fee: deliveryFee,
                status: 'assigned'
            });

            // Update order status to dispatched
            await orderRepository.updateStatus(orderId, 'dispatched', adminId);

            logger.info('Delivery assigned', {
                orderId,
                dispatchPartnerId,
                deliveryFee,
                assignedBy: adminId
            });

            return {
                assignment: await dispatchAssignmentRepository.findById(assignment.id),
                message: 'Delivery assigned successfully'
            };
        } catch (error) {
            logger.error('Assign delivery error', { error: error.message, orderId });
            throw error;
        }
    }

    async updateDeliveryStatus(assignmentId, status, updateData, userId) {
        try {
            const assignment = await dispatchAssignmentRepository.findById(assignmentId);
            if (!assignment) {
                throw new Error('Assignment not found');
            }

            // Validate assignment belongs to dispatch partner
            const partner = await dispatchPartnerRepository.findByUserId(userId);
            if (assignment.dispatch_partner_id !== partner.id) {
                throw new Error('You can only update your own assignments');
            }

            // Validate status transitions
            this.validateDispatchStatusTransition(assignment.status, status);

            // Update assignment status
            const updatedAssignment = await dispatchAssignmentRepository.updateStatus(
                assignmentId,
                status,
                updateData
            );

            // If delivered, process earnings and update order
            if (status === 'delivered') {
                await this.processDeliveryCompletion(assignmentId, partner.id);
            }

            // If failed, update order status back
            if (status === 'failed') {
                await orderRepository.updateStatus(assignment.order_id, 'cancelled', userId);
            }

            logger.info('Delivery status updated', {
                assignmentId,
                oldStatus: assignment.status,
                newStatus: status,
                updatedBy: userId
            });

            return await dispatchAssignmentRepository.findById(assignmentId);
        } catch (error) {
            logger.error('Update delivery status error', { error: error.message, assignmentId });
            throw error;
        }
    }

    async processDeliveryCompletion(assignmentId, partnerId) {
        try {
            const assignment = await dispatchAssignmentRepository.findById(assignmentId);

            // Calculate dispatch earnings (e.g., 80% of delivery fee)
            const commissionPercentage = 80; // Configurable
            const earningsAmount = (assignment.delivery_fee * commissionPercentage) / 100;

            // Create earnings record
            await dispatchEarningRepository.create({
                dispatch_partner_id: partnerId,
                assignment_id: assignmentId,
                amount: earningsAmount,
                commission_percentage: commissionPercentage,
                status: 'pending'
            });

            // Update order status to delivered
            await orderRepository.updateStatus(assignment.order_id, 'delivered', 'system');

            logger.info('Delivery completed and earnings processed', {
                assignmentId,
                partnerId,
                earningsAmount
            });
        } catch (error) {
            logger.error('Process delivery completion error', { error: error.message });
            throw error;
        }
    }

    async getPartnerDashboard(userId) {
        try {
            const partner = await dispatchPartnerRepository.findByUserId(userId);
            if (!partner) {
                throw new Error('Dispatch partner profile not found');
            }

            const [assignments, activeCount, earnings] = await Promise.all([
                dispatchAssignmentRepository.findByDispatchPartner(partner.id),
                dispatchAssignmentRepository.getActiveAssignments(partner.id),
                dispatchEarningRepository.getPartnerEarnings(partner.id)
            ]);

            return {
                partner: this.formatPartner(partner),
                activeDeliveries: parseInt(activeCount.count) || 0,
                totalEarnings: parseFloat(earnings.total_earnings) || 0,
                pendingEarnings: parseFloat(earnings.pending_earnings) || 0,
                paidEarnings: parseFloat(earnings.paid_earnings) || 0,
                recentAssignments: assignments.slice(0, 10)
            };
        } catch (error) {
            logger.error('Get partner dashboard error', { error: error.message, userId });
            throw error;
        }
    }

    async getAllPartners(filters) {
        try {
            const partners = await dispatchPartnerRepository.findAll(filters);
            return partners.map(p => this.formatPartner(p));
        } catch (error) {
            logger.error('Get all partners error', { error: error.message });
            throw error;
        }
    }

    validateDispatchStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            assigned: ['picked_up', 'cancelled'],
            picked_up: ['in_transit', 'cancelled'],
            in_transit: ['delivered', 'failed'],
            delivered: [],
            failed: [],
            cancelled: []
        };

        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new Error(`Cannot change dispatch status from ${currentStatus} to ${newStatus}`);
        }
    }

    formatPartner(partner) {
        return {
            id: partner.id,
            userId: partner.user_id,
            companyName: partner.company_name,
            contactPerson: partner.contact_person,
            contactPhone: partner.contact_phone,
            contactEmail: partner.contact_email,
            address: partner.address,
            city: partner.city,
            state: partner.state,
            vehicleType: partner.vehicle_type,
            licenseNumber: partner.license_number,
            isVerified: partner.is_verified,
            isActive: partner.is_active,
            email: partner.user_email,
            createdAt: partner.created_at
        };
    }
}

module.exports = new DispatchService();