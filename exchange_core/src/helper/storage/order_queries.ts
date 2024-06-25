import { Order, PrismaClient, Prisma, PaymentInstrument, PaymentInstrumentMapping} from "@prisma/client";


const ORDER_SELECTION_WITH_TABLE_NAME = Object.keys(Prisma.OrderScalarFieldEnum).map(field_name=>`o_${field_name}`).concat(",")
const PAYMENT_INSTRUMENT_SELECTION_WITH_TABLE_NAME = Object.keys(Prisma.PaymentInstrumentScalarFieldEnum).map(field_name=>`pi_${field_name}`).concat(",")
const PAYMENT_INSTRUMENT_MAPPING_SELECTION_WITH_TABLE_NAME = Object.keys(Prisma.PaymentInstrumentMappingScalarFieldEnum).map(field_name=>`pim_${field_name}`).concat(",")


const ORDER_TABLE_NAME = Prisma.ModelName["Order"]
const PAYMENT_INSTRUMENT_TABLE_NAME = Prisma.ModelName["PaymentInstrument"]
const PAYMENT_INSTRUMENT_MAPPING_TABLE_NAME = Prisma.ModelName["PaymentInstrumentMapping"]
type OrderInfo = Order & {source: PaymentInstrument&{mappings: PaymentInstrumentMapping[]}}

