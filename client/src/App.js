import { Button, ButtonGroup, Divider, Editable, EditableInput, EditablePreview, Flex, HStack, IconButton, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Text, Textarea, Tooltip, useColorMode, useColorModeValue, useEditableControls, VStack } from "@chakra-ui/react";
import { CheckIcon, CloseIcon, MoonIcon, SunIcon, ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import React from "react";

async function sendRequestGPT(API_KEY, message, max_tokens, temperature, presence, frequency) {
	console.log(`Parameters:\nKey: ${API_KEY}\nMessage: ${message}\nMax Tokens: ${max_tokens}\nTemperature: ${temperature}\nPresence: ${presence}\nFrequency: ${frequency}`);
	const response = await fetch(`https://api.openai.com/v1/completions`, {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + API_KEY
	  },
	  body: JSON.stringify({
		model: "text-davinci-003",
		prompt: message,
		max_tokens: max_tokens,
		temperature: temperature,
		presence_penalty: presence,
		frequency_penalty: frequency
	  })
	});

	const data = await response.json();
	return data;
}

const EditableControls = () => {
	const {
		isEditing,
		getSubmitButtonProps,
		getCancelButtonProps,
		getEditButtonProps,
	} = useEditableControls();

	return isEditing ? (
		<ButtonGroup justifyContent={`center`} size={`sm`}>
			<IconButton icon={<CheckIcon />} {...getSubmitButtonProps()} />
			<IconButton icon={<CloseIcon />} {...getCancelButtonProps()} />
		</ButtonGroup>
	) : (
		<Flex justifyContent='center'>
		  <IconButton size='sm' icon={<EditIcon />} {...getEditButtonProps()} />
		</Flex>
	)
}

const SliderThumbWithTooltip = ({sliderValue, setSliderValue, min, max, marks}) => {
	const [showTooltip, setShowTooltip] = React.useState(false);
	return (
	  <Slider
		id={`slider`}
		defaultValue={0}
		min={min}
		max={max}
		colorScheme={`green`}
		onChange={(v) => setSliderValue(v)}
		onMouseEnter={() => setShowTooltip(true)}
		onMouseLeave={() => setShowTooltip(false)}
	  >
		{
			marks.map((mark) => {
				return (
					<SliderMark key={mark} value={mark} mt='1' ml='-2.5' fontSize='sm'>{mark}%</SliderMark>
				);
			})
		}
		<SliderTrack>
		  <SliderFilledTrack />
		</SliderTrack>
		<Tooltip
		  hasArrow
		  bg={`green.500`}
		  color={`white`}
		  placement={`top`}
		  isOpen={showTooltip}
		  label={`${sliderValue}%`}
		>
		  <SliderThumb />
		</Tooltip>
	  </Slider>
	)
}

const App = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const chatBoxColorModeValue = useColorModeValue(`gray.100`, `gray.900`);
	const [query, setQuery] = React.useState(``);
	const [openAIKey, setOpenAIKey] = React.useState(`Paste Your OpenAI API Key`);
	const [maxTokensValue, setMaxTokensValue] = React.useState(256);
	const [temperatureValue, setTemperatureValue] = React.useState(0);
	const [presencePenaltyValue, setPresencePenaltyValue] = React.useState(0);
	const [frequencyPenaltyValue, setFrequencyPenaltyValue] = React.useState(0);
	const [responseArray, setResponseArray] = React.useState([]);
	const [responseCount, setResponseCount] = React.useState(0);
	const [submitButtonLoadingState, setSubmitButtonLoadingState] = React.useState(false);
	
	async function SubmitQuery() {
		const api_key = openAIKey;
		const prompt = query;
		const max_tokens = parseInt(maxTokensValue);
		const temperature = parseInt(temperatureValue)/100;
		const presence = parseInt(presencePenaltyValue)/100;
		const frequency = parseInt(frequencyPenaltyValue)/100;

		setSubmitButtonLoadingState(true);
		setQuery(``);

		const response = await sendRequestGPT(api_key, prompt, max_tokens, temperature, presence, frequency);
		console.log(response);
		setResponseCount(responseCount+1);

		if (response.error) {setResponseArray([...responseArray, {id: responseCount, message: `An error has been encountered!\nReason: ${response.error.message}`}]);}
		else {setResponseArray([...responseArray, {id: responseCount, message: response.choices[0].text.substring(2)}]);}
		setSubmitButtonLoadingState(false);
	}

	return (
		<Flex
			w={`100vw`}
			h={`100vh`}
			direction={{ base: `column`, md: `row` }}
		>
			<Flex
				position={`relative`}
				w={{ base: `100%`, md: `500px` }}
				h={{ base: `30%`, md: `100%` }}
				boxShadow={`2xl`}
				direction={`column`}
				overflowY={`scroll`}
			>
				<VStack>
					<Flex w={`100%`}><Button onClick={toggleColorMode} m={`10px`}>
						{colorMode === `light` ? <MoonIcon /> : <SunIcon />}
					</Button></Flex>
					<Editable
						w={`90%`}
						textAlign={`center`}
						defaultValue={`Paste Your OpenAI API Key`}
						value={openAIKey}
					>
						<Tooltip
							hasArrow
							label={`Click to edit`}
		  					bg={`green.500`}	
						>
							<EditablePreview
								w={`100%`}
								_hover={{
									background: useColorModeValue(`gray.100`, `gray.700`)
								}}
							/>
						</Tooltip>
						<Input
							as={EditableInput}
							value={openAIKey}
							onChange={(e) => setOpenAIKey(e.target.value)}
						/>
						<EditableControls />
					</Editable>
				</VStack>
				<Divider m={`20px 0px 20px 0px`} />
				<HStack>
					<Tooltip
						hasArrow
						label={`The maximum number of tokens to generate in the completion.`}
		  				bg={`green.500`}
					>
						<Text m={`10px 0px 10px 10px`} flexWrap={`nowrap`}>Max Tokens</Text>
					</Tooltip>
					<Flex>
					<NumberInput m={`10px`} size={`md`} step={2} defaultValue={256} min={0} max={4096}
						value={maxTokensValue} onChange={(e) => setMaxTokensValue(e)}
					>
						<NumberInputField />
						<NumberInputStepper>
							<NumberIncrementStepper />
							<NumberDecrementStepper />
						</NumberInputStepper>
					</NumberInput>
					</Flex>
				</HStack>
				<Divider mt={`20px`} />
				<VStack mb={`30px`}>
					<Tooltip
						hasArrow
						label={`Higher value means the model will take more "creative" risks. Use 0% for applications requiring a well-defined answer.`}
						bg={`green.500`}
					>
						<Text m={`10px`}>Temperature</Text>
					</Tooltip>
					<Flex w={`90%`}><SliderThumbWithTooltip sliderValue={temperatureValue} setSliderValue={setTemperatureValue} min={0} max={100} marks={[25,50,75]}/></Flex>
				</VStack>
				<Divider mt={`20px`} />
				<VStack mb={`30px`}>
					<Tooltip
						hasArrow
						label={`Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.`}
						bg={`green.500`}
					>
						<Text m={`10px`}>Presence Penalty</Text>
					</Tooltip>
					<Flex w={`90%`}><SliderThumbWithTooltip sliderValue={presencePenaltyValue} setSliderValue={setPresencePenaltyValue} min={-200} max={200} marks={[-150,-50,50,150]}/></Flex>
				</VStack>
				<Divider mt={`20px`} />
				<VStack mb={`30px`}>
					<Tooltip
						hasArrow
						label={`Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.`}
						bg={`green.500`}
					>
						<Text m={`10px`}>Frequency Penalty</Text>
					</Tooltip>
					<Flex w={`90%`}><SliderThumbWithTooltip sliderValue={frequencyPenaltyValue} setSliderValue={setFrequencyPenaltyValue} min={-200} max={200} marks={[-150,-50,50,150]}/></Flex>
				</VStack>
			</Flex>

			<Flex
				w={`100%`}
				h={{base: `70%`, md: `100%`}}
				direction={`column`}
			>
				<Flex
					w={`100%`}
					h={`100%`}
					p={`10px`}
					overflowY={`scroll`}
					direction={`column`}
					alignItems={`center`}
				>
					{
						responseArray.map((data) => {
							return (
									<Text
										key={data.id}
										w={`90%`}
										background={chatBoxColorModeValue}
										rounded={`md`}
										p={`10px`}
										m={`5px`}
										style={{whiteSpace: `pre-wrap`}}
										boxShadow={`md`}
									>
										{data.message}
									</Text>
							);
						})
					}
				</Flex>
				<HStack m={`10px`}>
					<Textarea 
						placeholder={`Insert your query here...`}
						value={query}
						onChange={(e) => setQuery(e.currentTarget.value)}
					/>
					<Button type={`submit`} onClick={SubmitQuery} isLoading={submitButtonLoadingState}>
						<ChevronRightIcon />
					</Button>
				</HStack>
			</Flex>
		</Flex>
	);
}

export default App;